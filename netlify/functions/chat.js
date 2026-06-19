exports.handler = async (event, context) => {
  // 1. Verificamos que sea una petición POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2. Extraemos el mensaje (prompt) de tu index.html
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: "El prompt está vacío" }) };
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    
    // 3. Llamamos a la API de Google de forma directa (sin librerías problemáticas)
    const googleURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(googleURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 4. Si Google nos da un error (como un 400), lo capturamos y lo mostramos claro
    if (!response.ok) {
      console.error("Detalle exacto del error de Google:", JSON.stringify(data));
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Google rechazó la petición: ${data.error?.message || 'Error desconocido'}` })
      };
    }

    // 5. Si todo sale bien, enviamos la respuesta de vuelta a tu web
    const reply = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: reply }),
    };

  } catch (error) {
    console.error("Error general en el servidor:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
