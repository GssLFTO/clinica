// Esta función actúa como tu servidor privado seguro.
// Los pacientes no pueden ver este código en su navegador.

exports.handler = async function(event, context) {
  // 1. Verificamos que solo se permitan peticiones POST (envío de datos)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  // 2. Tomamos tu API Key desde las "Variables de Entorno" secretas de Netlify.
  // ¡Nunca la escribimos aquí directamente!
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error("Error: La API Key no está configurada en Netlify.");
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Configuración de servidor incompleta.' }) 
    };
  }

  try {
    // 3. Leemos lo que nos envió la página web (el mensaje del paciente y el historial)
    const body = JSON.parse(event.body);
    const { contents, systemInstruction } = body;

    // 4. Preparamos la llamada a Google Gemini, ahora sí usando la llave secreta
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction })
    });

    if (!response.ok) {
      throw new Error(`Error de la API de Google: ${response.status}`);
    }

    // 5. Recibimos la respuesta de Google y se la enviamos de vuelta a tu página web
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("Error en el servidor seguro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudo conectar con la Inteligencia Artificial.' })
    };
  }
};
