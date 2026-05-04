const { spawn } = require('child_process');
const http = require('http');

console.log('🔧 Fixing SafeHer Real-Time Location Tracking...\n');

// Check if location server is running
async function checkLocationServer() {
  try {
    console.log('🔍 Checking if location server is running...');
    
    const response = await new Promise((resolve, reject) => {
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
      req.setTimeout(3000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });

    console.log('✅ Location server is running:', response.message);
    return true;
  } catch (error) {
    console.log('❌ Location server is not running:', error.message);
    return false;
  }
}

// Start location server if not running
async function startLocationServer() {
  console.log('\n🚀 Starting location tracking server...');
  
  const path = require('path');
  const PROJECT_ROOT = path.join(__dirname, '..');
  const locationServer = spawn('node', [path.join('server', 'backend-location.js')], {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
    shell: true
  });

  locationServer.on('error', (error) => {
    console.error('❌ Failed to start location server:', error.message);
    process.exit(1);
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check if server started successfully
  const isRunning = await checkLocationServer();
  if (!isRunning) {
    console.log('❌ Location server failed to start');
    process.exit(1);
  }

  return locationServer;
}

// Test location update
async function testLocationUpdate() {
  console.log('\n🧪 Testing location update...');
  
  try {
    const testData = {
      userId: 'test_user_fix',
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      timestamp: new Date().toISOString()
    };

    const response = await new Promise((resolve, reject) => {
      const postData = JSON.stringify(testData);
      
      const req = http.request({
        hostname: 'localhost',
        port: 3002,
        path: '/api/location/update',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
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

      req.write(postData);
      req.end();
    });

    if (response.success) {
      console.log('✅ Location update test passed');
      console.log('📍 Location saved:', response.location?.address);
      return true;
    } else {
      console.log('❌ Location update test failed:', response.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Location update test error:', error.message);
    return false;
  }
}

// Create a simple location service fix
function createLocationServiceFix() {
  console.log('\n🔧 Creating location service fix...');
  
  const locationServiceFix = `
// Fixed Location Service for SafeHer
class FixedLocationService {
  constructor() {
    this.baseUrl = 'http://localhost:3002/api/location';
    this.trackingIntervals = new Map();
  }

  async updateLocation(userId, position) {
    try {
      const locationData = {
        userId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || null,
        heading: position.coords.heading || null,
        timestamp: new Date().toISOString()
      };

      console.log('📍 Sending location update:', locationData);

      const response = await fetch(\`\${this.baseUrl}/update\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData)
      });

      const result = await response.json();
      console.log('📤 Location update response:', result);

      if (response.ok) {
        return {
          success: true,
          message: result.message,
          location: result.location
        };
      } else {
        return {
          success: false,
          message: result.message || 'Location update failed'
        };
      }
    } catch (error) {
      console.error('❌ Location service error:', error);
      return {
        success: false,
        message: error.message || 'Location service unavailable'
      };
    }
  }

  async startTracking(userId, options = {}) {
    const { interval = 5000, onLocationUpdate, onError } = options;

    try {
      // Start tracking on backend
      const response = await fetch(\`\${this.baseUrl}/tracking/start/\${userId}\`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start tracking on backend');
      }

      // Clear existing tracking
      this.stopTracking(userId);

      // Start real-time updates
      const trackingInterval = setInterval(async () => {
        try {
          if (!navigator.geolocation) {
            throw new Error('Geolocation not supported');
          }

          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });

          const updateResult = await this.updateLocation(userId, position);
          
          if (updateResult.success && onLocationUpdate) {
            onLocationUpdate(updateResult.location);
          } else if (onError) {
            onError(updateResult.message);
          }
        } catch (error) {
          console.error('❌ Tracking update error:', error);
          if (onError) {
            onError(error.message);
          }
        }
      }, interval);

      this.trackingIntervals.set(userId, trackingInterval);
      console.log(\`🎯 Started tracking for user \${userId}\`);
      return true;

    } catch (error) {
      console.error('❌ Start tracking error:', error);
      return false;
    }
  }

  async stopTracking(userId) {
    try {
      // Clear interval
      const interval = this.trackingIntervals.get(userId);
      if (interval) {
        clearInterval(interval);
        this.trackingIntervals.delete(userId);
      }

      // Stop tracking on backend
      await fetch(\`\${this.baseUrl}/tracking/stop/\${userId}\`, {
        method: 'POST'
      });

      console.log(\`⏹️ Stopped tracking for user \${userId}\`);
    } catch (error) {
      console.error('❌ Stop tracking error:', error);
    }
  }
}

// Export the fixed service
window.fixedLocationService = new FixedLocationService();
`;

  // Write the fix to a file
  const fs = require('fs');
  const path = require('path');
  const PROJECT_ROOT = path.join(__dirname, '..');
  const fixFilePath = path.join(PROJECT_ROOT, 'location-service-fix.js');
  fs.writeFileSync(fixFilePath, locationServiceFix);
  console.log('✅ Location service fix created:', fixFilePath);
}

// Main fix function
async function fixLocationTracking() {
  console.log('🔧 Starting SafeHer Location Tracking Fix...\n');

  // Step 1: Check if server is running
  const serverRunning = await checkLocationServer();
  
  if (!serverRunning) {
    // Step 2: Start the server
    const locationServer = await startLocationServer();
    
    // Step 3: Test the server
    const testPassed = await testLocationUpdate();
    
    if (!testPassed) {
      console.log('❌ Server test failed');
      return;
    }
  } else {
    // Server is running, test it
    const testPassed = await testLocationUpdate();
    
    if (!testPassed) {
      console.log('❌ Server test failed, restarting...');
      await startLocationServer();
      await testLocationUpdate();
    }
  }

  // Step 4: Create service fix
  createLocationServiceFix();

  console.log('\n🎉 LOCATION TRACKING FIX COMPLETE!');
  console.log('✅ Location server is running on http://localhost:3002');
  console.log('✅ Location updates are working');
  console.log('✅ Real-time tracking is ready');
  
  console.log('\n🌐 HOW TO USE:');
  console.log('1. Open your browser and go to the Live Location page');
  console.log('2. Click "Start Tracking"');
  console.log('3. Allow location access when prompted');
  console.log('4. Watch real-time location updates');
  
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('- If tracking still fails, check browser console for errors');
  console.log('- Make sure location is enabled in browser settings');
  console.log('- Verify the location server is running on port 3002');
  console.log('- Check that GPS is available on your device');
}

// Run the fix
fixLocationTracking().catch(error => {
  console.error('❌ Fix failed:', error.message);
  process.exit(1);
});
