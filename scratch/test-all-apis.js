// Test all dashboard API endpoints
async function test() {
  // Login first
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin1@globaledu.com', password: 'password123' }),
  });
  const setCookie = loginRes.headers.get('set-cookie');
  const token = setCookie.match(/auth-token=([^;]+)/)[1];
  const headers = { 'Cookie': `auth-token=${token}` };
  
  // Test various API endpoints
  const endpoints = [
    { name: 'Admin Agents', url: '/api/admin/agents' },
    { name: 'Admin Settings', url: '/api/admin/settings' },
    { name: 'Notifications', url: '/api/notifications' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep.url}`, { headers });
      const data = await res.json();
      console.log(`${ep.name}: ${res.status} ${res.ok ? '✅' : '❌'} ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (err) {
      console.log(`${ep.name}: ❌ ERROR: ${err.message}`);
    }
  }

  // Test as student too
  const stuLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john.doe@gmail.com', password: 'password123' }),
  });
  const stuCookie = stuLogin.headers.get('set-cookie');
  const stuToken = stuCookie.match(/auth-token=([^;]+)/)[1];
  const stuHeaders = { 'Cookie': `auth-token=${stuToken}` };

  const stuEndpoints = [
    { name: 'Student Me', url: '/api/auth/me' },
    { name: 'Student App', url: '/api/student/application' },
    { name: 'Student Notifications', url: '/api/notifications' },
    { name: 'Student Messages', url: '/api/messages' },
  ];

  console.log('\n--- Student Tests ---');
  for (const ep of stuEndpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep.url}`, { headers: stuHeaders });
      const data = await res.json();
      console.log(`${ep.name}: ${res.status} ${res.ok ? '✅' : '❌'} ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (err) {
      console.log(`${ep.name}: ❌ ERROR: ${err.message}`);
    }
  }

  // Test as agent
  const agentLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah.j@globaledu.com', password: 'password123' }),
  });
  const agentCookie = agentLogin.headers.get('set-cookie');
  const agentToken = agentCookie.match(/auth-token=([^;]+)/)[1];
  const agentHeaders = { 'Cookie': `auth-token=${agentToken}` };

  const agentEndpoints = [
    { name: 'Agent Me', url: '/api/auth/me' },
    { name: 'Agent Unassigned', url: '/api/agent/unassigned' },
    { name: 'Agent Messages', url: '/api/messages' },
  ];

  console.log('\n--- Agent Tests ---');
  for (const ep of agentEndpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep.url}`, { headers: agentHeaders });
      const data = await res.json();
      console.log(`${ep.name}: ${res.status} ${res.ok ? '✅' : '❌'} ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (err) {
      console.log(`${ep.name}: ❌ ERROR: ${err.message}`);
    }
  }

  // Test super admin
  const saLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@platform.com', password: 'password123' }),
  });
  const saCookie = saLogin.headers.get('set-cookie');
  const saToken = saCookie.match(/auth-token=([^;]+)/)[1];
  const saHeaders = { 'Cookie': `auth-token=${saToken}` };

  console.log('\n--- Super Admin Tests ---');
  try {
    const res = await fetch('http://localhost:3000/api/super-admin/agencies', { headers: saHeaders });
    const data = await res.json();
    console.log(`SA Agencies: ${res.status} ${res.ok ? '✅' : '❌'} ${JSON.stringify(data).substring(0, 100)}...`);
  } catch (err) {
    console.log(`SA Agencies: ❌ ERROR: ${err.message}`);
  }
}

test();
