const { spawn } = require('child_process');
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '..');

console.log('🚀 Starting SafeHer Live Location Backend...\n');

// Start location backend server
console.log('📍 Starting location tracking server on port 3002...');
const locationServer = spawn('node', [path.join('server', 'backend-location.js')], {
  stdio: 'inherit',
  cwd: PROJECT_ROOT,
  shell: true
});

locationServer.on('error', (error) => {
  console.error('❌ Failed to start location server:', error.message);
  console.log('💡 Try running manually: node server/backend-location.js');
  process.exit(1);
});

locationServer.on('close', (code) => {
  console.log(`\n📍 Location server exited with code ${code}`);
  if (code !== 0) {
    console.log('❌ Location server crashed. Check the error messages above.');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down location server...');
  locationServer.kill('SIGINT');
  process.exit(0);
});

// Test the server after it starts
setTimeout(async () => {
  console.log('\n🧪 Testing location server...');
  
  try {
    const http = require('http');
    
    const testHealthCheck = () => {
      return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3002/api/location/health', (res) => {
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
    console.log('✅ Location server is healthy:', health.message);
    console.log('🔧 Services configured:', health.services);
    
    console.log('\n🎯 LOCATION BACKEND IS READY!');
    console.log('📍 Real-time GPS tracking active');
    console.log('🗺️  Geocoding via OpenStreetMap');
    console.log('💾 In-memory database with location history');
    
    console.log('\n🌐 NOW TEST THE LIVE LOCATION:');
    console.log('1. Go to Live Location page in your app');
    console.log('2. Click "Start Tracking"');
    console.log('3. Allow browser location access');
    console.log('4. Watch real-time location updates');
    console.log('5. See address geocoding in action');
    
    console.log('\n📱 Available API Endpoints:');
    console.log('📊 Health: http://localhost:3002/api/location/health');
    console.log('📍 Update: POST http://localhost:3002/api/location/update');
    console.log('👥 All users: http://localhost:3002/api/location/all');
    console.log('📈 Distance: http://localhost:3002/api/location/distance/user1/user2');
    
  } catch (error) {
    console.log('❌ Location server test failed:', error.message);
    console.log('💡 Make sure the server started successfully');
  }
}, 3000);

console.log('⏳ Starting location tracking server...');
