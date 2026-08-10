async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin1@globaledu.com', password: 'password123' }),
  });
  const setCookie = loginRes.headers.get('set-cookie');
  const tokenMatch = setCookie.match(/auth-token=([^;]+)/);
  if (!tokenMatch) {
    console.error('NO COOKIE RETURNED');
    return;
  }
  const token = tokenMatch[1];
  
  const dashboardRes = await fetch('http://localhost:3000/dashboard', {
    headers: { 'Cookie': `auth-token=${token}` },
    redirect: 'manual'
  });
  
  console.log('DASHBOARD STATUS:', dashboardRes.status);
  console.log('DASHBOARD REDIRECT:', dashboardRes.headers.get('location'));
}
test();
