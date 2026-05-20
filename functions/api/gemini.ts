// Helper to verify JWT using Web Crypto API (dependency-free)
async function verifyJWT(token: string, secret: string): Promise<any | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const fromBase64Url = (str: string) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return atob(padded);
  };
  
  try {
    const signatureBin = fromBase64Url(encodedSignature);
    const signatureBytes = new Uint8Array(signatureBin.length);
    for (let i = 0; i < signatureBin.length; i++) {
      signatureBytes[i] = signatureBin.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(tokenInput)
    );
    
    if (!isValid) return null;
    
    const payloadJson = fromBase64Url(encodedPayload);
    const payload = JSON.parse(payloadJson);
    
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string; JWT_SECRET?: string }> = async ({ request, env }) => {
  // 1. JWT TOKEN VERIFICATION
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid token format' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.substring(7);
  const jwtSecret = env.JWT_SECRET || 'fallback-dev-secret-key-12345';
  const decodedToken = await verifyJWT(token, jwtSecret);

  if (!decodedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Token is invalid or expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const API_KEY = env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Gemini API Key is not configured in environment variables' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    
    // Forward request to Google Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
