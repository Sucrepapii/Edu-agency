// Quick test to verify login + /api/auth/me flow
async function test() {
  try {
    // Step 1: Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin1@globaledu.com', password: 'password123' }),
    });
    
    console.log('LOGIN STATUS:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('LOGIN DATA:', JSON.stringify(loginData, null, 2));
    
    // Extract cookie
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('SET-COOKIE:', setCookie);
    
    if (!setCookie) {
      console.error('NO COOKIE SET!');
      return;
    }
    
    // Extract token from set-cookie header
    const tokenMatch = setCookie.match(/auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : '';
    console.log('TOKEN LENGTH:', token.length);
    console.log('TOKEN PREVIEW:', token.substring(0, 50) + '...');
    
    // Step 2: Test /api/auth/me with the token
    const meRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Cookie': `auth-token=${token}` },
    });
    
    console.log('\nME STATUS:', meRes.status);
    const meData = await meRes.json();
    console.log('ME DATA:', JSON.stringify(meData, null, 2));
    
    // Step 3: Test /api/notifications with the token
    const notifRes = await fetch('http://localhost:3000/api/notifications', {
      headers: { 'Cookie': `auth-token=${token}` },
    });
    
    console.log('\nNOTIFICATIONS STATUS:', notifRes.status);
    const notifData = await notifRes.json();
    console.log('NOTIFICATIONS DATA:', JSON.stringify(notifData, null, 2));
    
  } catch (err) {
    console.error('TEST ERROR:', err);
  }
}

test();
