import { getJwtSecret, verifyJWT } from './_shared/jwt';

export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string; GEMINI_MODEL?: string; JWT_SECRET?: string }> = async ({ request, env }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid token format' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.substring(7);
  let jwtSecret: string;
  try {
    jwtSecret = getJwtSecret(env);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const decodedToken = await verifyJWT(token, jwtSecret);

  if (!decodedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Token is invalid or expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const API_KEY = env.GEMINI_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'Gemini API Key is not configured in environment variables' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const MODEL = env.GEMINI_MODEL || 'gemini-2.0-flash';

  try {
    const body = await request.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return new Response(JSON.stringify({ error: 'Invalid response from Gemini API', details: text }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const geminiError = data?.error?.message || JSON.stringify(data);
      const isModelError = response.status === 404 || geminiError.toLowerCase().includes('not found') || geminiError.toLowerCase().includes('not supported');
      return new Response(JSON.stringify({
        error: isModelError
          ? 'Model AI yang dikonfigurasi sudah tidak tersedia, hubungi administrator untuk update konfigurasi'
          : 'Gemini API returned an error',
        model: MODEL,
        details: geminiError
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    const message = error.message || 'Unknown error';
    if (message.includes('fetch') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      return new Response(JSON.stringify({ error: 'Cannot reach Gemini API. Check network connectivity and API endpoint.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
