// Quick script to check if backend is running
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running! Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Backend is NOT running!');
  console.error('Error:', e.message);
  console.log('\n💡 To start backend:');
  console.log('   cd backend');
  console.log('   npm start');
  console.log('   or');
  console.log('   npm run dev');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Backend connection timeout!');
  req.destroy();
  process.exit(1);
});

req.end();


