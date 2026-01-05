// netlify/functions/reservas.js

const ENDPOINT = "https://script.google.com/macros/s/AKfycbxwF094pq0JOZWIalz7FFbWMyBFahwOQERU_SVYFR3XE2fm0xbtsFj3UDFfsO38CfXF/exec";

// Para Netlify Functions você usa export const handler
export const handler = async function(event) {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    // GET → repassa para o Apps Script
    if (event.httpMethod === "GET") {
      const res = await fetch(ENDPOINT);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: "Apps Script retornou JSON inválido", raw: text })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // POST → repassa para o Apps Script
    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body);

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: "Apps Script retornou JSON inválido", raw: text })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Método HTTP não permitido" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
