const ENDPOINT = "https://script.google.com/macros/s/AKfycbxwF094pq0JOZWIalz7FFbWMyBFahwOQERU_SVYFR3XE2fm0xbtsFj3UDFfsO38CfXF/exec";

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: "" };
    }

    if (event.httpMethod === "GET") {
      const res = await fetch(ENDPOINT);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método não permitido" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}
