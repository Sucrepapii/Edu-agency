const encoder = new TextEncoder();

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  // Convert buffer to binary string
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Base64 encode and format as base64url
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if necessary
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function signJWT(payload: any, secretStr: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerStr = arrayBufferToBase64Url(encoder.encode(JSON.stringify(header)).buffer);
  const payloadStr = arrayBufferToBase64Url(
    encoder.encode(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours expiry
      })
    ).buffer
  );

  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(`${headerStr}.${payloadStr}`)
  );

  const signatureStr = arrayBufferToBase64Url(signature);
  return `${headerStr}.${payloadStr}.${signatureStr}`;
}

export async function verifyJWT(token: string, secretStr: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerStr, payloadStr, signatureStr] = parts;

    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlToArrayBuffer(signatureStr);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      secretKey,
      signature,
      encoder.encode(`${headerStr}.${payloadStr}`)
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToArrayBuffer(payloadStr));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token has expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}
