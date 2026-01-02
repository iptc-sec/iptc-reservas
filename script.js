document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const reservas = {};
  const feriados = ['2026-01-01', '2026-12-25'];
  const senhaAdmin = 'SecretariaIPTC2026';
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbxGQiMMOmGu0Nx_I8CMNlYn-BIWTW3ZD276dsM-WxYARlbPRRUOJIdze5QHTAkJgxc/exec";

  let usuarioAdmin = false;
  let dataSelecionada = null;
  let btnReservar = null;

  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const adminStatus = document.getElementById('admin-status');
  const modal = document.getElementById('modal-reserva');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const listaReservas = document.getElementById('lista-reservas');
  const dataExibida = document.getElementById('data-exibida');
  const formReserva = document.getElementById('form-reserva');
  const inputNome = document.getElementById('input-nome');
  const inputTelefone = document.getElementById('input-telefone');
  const inputEmail = document.getElementById('input-email');

  const painelAdmin = document.getElementById('painel-admin');
  const todasReservas = document.getElementById('todas-reservas');
  const reservasDia = document.getElementById('reservas-dia');
  const btnFecharPainel = document.getElementById('btn-fechar-painel');
  const btnAbrirPainel = document.getElementById('btn-abrir-painel');
  const abas = document.querySelectorAll('.aba-painel');

  btnLogout.style.display = 'none';

  // -----------------------
  // MODAL
  // -----------------------
  btnCloseModal.onclick = () => modal.style.display = 'none';
  modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  function destacarDia(data) {
    document.querySelectorAll('.fc-day-selected').forEach(d => d.classList.remove('fc-day-selected'));
    const diaEl = document.querySelector(`.fc-daygrid-day[data-date='${data}']`);
    if (diaEl) diaEl.classList.add('fc-day-selected');
    dataSelecionada = data;
  }

  function mostrarBotaoReservar() {
    if (!dataSelecionada) return;
    if (btnReservar) btnReservar.remove();
    const diaEl = document.querySelector(`.fc-daygrid-day[data-date='${dataSelecionada}']`);
    if (!diaEl) return;

    btnReservar = document.createElement('button');
    btnReservar.textContent = 'Reservar';
    btnReservar.className = 'btn-reservar-dia';
    btnReservar.onclick = abrirModal;

    diaEl.style.position = 'relative';
    diaEl.appendChild(btnReservar);
  }

  function abrirModal() {
    if (!dataSelecionada) return;
    const [y, m, d] = dataSelecionada.split('-');
    dataExibida.textContent = `${d}/${m}/${y}`;
    modal.style.display = 'flex';
    atualizarLista();
  }

  function atualizarLista() {
    listaReservas.innerHTML = '';
    (reservas[dataSelecionada] || []).forEach((r, idx) => {
      const div = document.createElement('div');
      div.className = 'reserva-item';
      div.textContent = `${r.nome} - ${r.numero} - ${r.email || 'sem email'}`;

      if (usuarioAdmin) {
        const btnDel = document.createElement('button');
        btnDel.textContent = 'X';
        btnDel.onclick = () => {
          reservas[dataSelecionada].splice(idx, 1);
          calendar.getEvents().forEach(ev => {
            if (ev.startStr === dataSelecionada) ev.remove();
          });
          atualizarLista();
          atualizarPainelAdmin();
        };
        div.appendChild(btnDel);
      }

      listaReservas.appendChild(div);
    });
  }

  // -----------------------
  // FULLCALENDAR
  // -----------------------
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    hiddenDays: [0],
    fixedWeekCount: false,
    selectable: true,
    height: 'auto',
    dateClick(info) {
      destacarDia(info.dateStr);
      mostrarBotaoReservar();
    }
  });

  calendar.render();

  // -----------------------
  // ADICIONAR RESERVA + INTEGRAÇÃO GOOGLE CALENDAR
  // -----------------------
  formReserva.onsubmit = async e => {
    e.preventDefault();
    if (!dataSelecionada) return;

    const nome = inputNome.value.trim();
    const numero = inputTelefone.value.trim();
    const email = inputEmail.value.trim();

    if (!nome || !numero.match(/^\d{1,15}$/)) {
      alert('Preencha corretamente nome e telefone.');
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      alert('Email inválido.');
      return;
    }

    if (feriados.includes(dataSelecionada)) {
      alert('Não é possível reservar em feriados.');
      return;
    }

    const diaSemana = new Date(dataSelecionada).getDay();
    const limite = diaSemana === 6 ? 2 : 1;
    if (!reservas[dataSelecionada]) reservas[dataSelecionada] = [];
    if (reservas[dataSelecionada].length >= limite) {
      alert('Número máximo de reservas atingido para este dia.');
      return;
    }

    // Adiciona a reserva localmente
    reservas[dataSelecionada].push({ nome, numero, email });
    calendar.addEvent({ title: nome.split(' ')[0], start: dataSelecionada, allDay: true });
    atualizarLista();
    if (usuarioAdmin) atualizarPainelAdmin();
    formReserva.reset();

    // Envia a reserva para o Google Calendar via Web App
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, numero, email, data: dataSelecionada })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Reserva enviada ao Google Calendar com sucesso!');
      } else {
        console.error('Erro ao enviar a reserva:', result.error);
        alert('Reserva criada localmente, mas não foi possível salvar no Google Calendar.');
      }
    } catch (err) {
      console.error('Erro na requisição para o Web App:', err);
      alert('Reserva criada localmente, mas não foi possível salvar no Google Calendar.');
    }
  };

  // -----------------------
  // LOGIN/LOGOUT ADMIN
  // -----------------------
  btnLogin.onclick = () => {
    const senha = document.getElementById('senha-admin').value;
    if (senha === senhaAdmin) {
      usuarioAdmin = true;
      adminStatus.textContent = "Administrador ativo";
      btnLogout.style.display = 'inline-block';
      document.getElementById('senha-admin').style.display = 'none';
      btnLogin.style.display = 'none';
      painelAdmin.classList.add('ativo');
      atualizarPainelAdmin();
      atualizarBotaoAbrirPainel();
    } else alert('Senha incorreta!');
  };

  btnLogout.onclick = () => {
    usuarioAdmin = false;
    adminStatus.textContent = '';
    btnLogout.style.display = 'none';
    document.getElementById('senha-admin').style.display = 'inline-block';
    btnLogin.style.display = 'inline-block';
    painelAdmin.classList.remove('ativo');
    atualizarBotaoAbrirPainel();
  };

  btnFecharPainel.onclick = () => {
    painelAdmin.classList.remove('ativo');
    setTimeout(() => atualizarBotaoAbrirPainel(), 500);
  };

  btnAbrirPainel.onclick = () => {
    painelAdmin.classList.add('ativo');
    btnAbrirPainel.classList.remove('visivel');
    btnAbrirPainel.classList.add('oculto');
  };

  // -----------------------
  // ABAS DO PAINEL
  // -----------------------
  abas.forEach(aba => {
    aba.addEventListener('click', () => {
      abas.forEach(a => a.classList.remove('ativo'));
      aba.classList.add('ativo');
      const target = aba.dataset.aba;
      document.querySelectorAll('.conteudo-aba').forEach(c => c.style.display = 'none');
      if (target === 'todas') todasReservas.style.display = 'block';
      if (target === 'por-dia') reservasDia.style.display = 'block';
    });
  });

  // -----------------------
  // FUNÇÕES AUXILIARES
  // -----------------------
  function atualizarPainelAdmin() {
    todasReservas.innerHTML = '';
    reservasDia.innerHTML = '';
    for (const data in reservas) {
      reservas[data].forEach(r => {
        const div = document.createElement('div');
        const [y, m, d] = data.split('-');
        const dataFormatada = `${d}/${m}/${y}`;
        div.className = 'reserva-todo-dia';
        div.innerHTML = `<span>${r.nome}</span> - ${r.numero} - ${r.email || 'sem email'} <br><em>${dataFormatada}</em>`;
        todasReservas.appendChild(div);
      });

      const divDia = document.createElement('div');
      const [y, m, d] = data.split('-');
      const dataFormatada = `${d}/${m}/${y}`;
      divDia.className = 'reserva-todo-dia';
      divDia.innerHTML = `<span>${dataFormatada}</span> - ${reservas[data].length} reserva(s)`;
      reservasDia.appendChild(divDia);
    }
  }

  function atualizarBotaoAbrirPainel() {
    if (usuarioAdmin && !painelAdmin.classList.contains('ativo')) {
      btnAbrirPainel.classList.remove('oculto');
      btnAbrirPainel.classList.add('visivel');
    } else {
      btnAbrirPainel.classList.remove('visivel');
      btnAbrirPainel.classList.add('oculto');
    }
  }
});
