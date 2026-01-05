// Netlify Function para enviar reservas ao Google Apps Script
const fetch = require("node-fetch"); // se usar Node 18+ do Netlify, não precisa instalar

const ENDPOINT = "https://script.google.com/macros/s/AKfycbxwF094pq0JOZWIalz7FFbWMyBFahwOQERU_SVYFR3XE2fm0xbtsFj3UDFfsO38CfXF/exec";

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método não permitido" }),
      };
    }

    const data = JSON.parse(event.body);

    // Envia para o Apps Script
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // liberação CORS para o frontend
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(result)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
