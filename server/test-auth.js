const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const registerRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste@exemplo.com', password: '123456' })
    });
    const registerData = await registerRes.json();
    console.log('REGISTER', registerRes.status, registerData);

    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste@exemplo.com', password: '123456' })
    });
    const loginData = await loginRes.json();
    console.log('LOGIN', loginRes.status, loginData);
  } catch (error) {
    console.error('ERROR', error);
    process.exit(1);
  }
}

run();
