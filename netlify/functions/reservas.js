// netlify/functions/reservas.js

const ENDPOINT = "https://script.google.com/macros/s/AKfycbxwF094pq0JOZWIalz7FFbWMyBFahwOQERU_SVYFR3XE2fm0xbtsFj3UDFfsO38CfXF/exec";

export async function handler(event) {
  // Permite CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Requisições OPTIONS (preflight) só retornam 200
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    if (event.httpMethod === "GET") {
      // Apenas repassa GET para o Apps Script
      const res = await fetch(ENDPOINT);
      const data = await res.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (event.httpMethod === "POST") {
      const data = JSON.parse(event.body);

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Método não permitido" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
