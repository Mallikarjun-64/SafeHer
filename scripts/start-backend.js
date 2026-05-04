const { spawn } = require('child_process');
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '..');

console.log('🚀 Starting SafeHer Backend Server...\n');

// Start the simple backend server
console.log('📡 Starting simple alert server on port 3001...');
const backend = spawn('node', [path.join('server', 'simple-server.js')], {
  stdio: 'inherit',
  cwd: PROJECT_ROOT,
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error.message);
  console.log('\n💡 Try running manually: node server/simple-server.js');
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`\n📡 Backend server exited with code ${code}`);
  if (code !== 0) {
    console.log('❌ Backend server crashed. Check the error messages above.');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

// Test the server after it starts
setTimeout(async () => {
  console.log('\n🧪 Testing backend server...');
  
  try {
    const http = require('http');
    
    const testHealthCheck = () => {
      return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3001/api/health', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });
    };

    const health = await testHealthCheck();
    console.log('✅ Backend server is healthy:', health.message);
    console.log('📊 Server has processed', health.alertsProcessed, 'alerts');
    
    console.log('\n🎯 Backend server is ready!');
    console.log('🌐 Now you can test the "Test Alert" button in the Guardian Management page');
    console.log('📱 The server will simulate SMS and email delivery with high success rates');
    
  } catch (error) {
    console.log('❌ Backend server test failed:', error.message);
    console.log('💡 Make sure the server started successfully');
  }
}, 3000);

console.log('⏳ Waiting for server to start...');
