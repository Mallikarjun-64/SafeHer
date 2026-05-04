const { spawn } = require('child_process');
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '..');

console.log('🚀 Starting SafeHer Application Servers...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('node', [path.join('server', 'server.js')], {
  stdio: 'inherit',
  cwd: PROJECT_ROOT
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error.message);
  console.log('💡 Make sure you have installed dependencies: cd server && npm install');
});

backend.on('close', (code) => {
  console.log(`\n📡 Backend server exited with code ${code}`);
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('\n🌐 Starting frontend development server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('❌ Failed to start frontend server:', error.message);
  });

  frontend.on('close', (code) => {
    console.log(`\n🌐 Frontend server exited with code ${code}`);
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

}, 2000);

console.log('⏳ Waiting for servers to start...');
