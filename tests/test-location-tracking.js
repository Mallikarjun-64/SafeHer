const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing SafeHer Real-Time Location Tracking...\n');

// Test data
const testUserId = `test_user_${Date.now()}`;
const testLocation = {
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10,
  timestamp: new Date().toISOString()
};

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('🔍 Test 1: Health Check');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/location/health',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('📊 Server status:', response.data.status);
      console.log('🔧 Services:', response.data.services);
      return true;
    } else {
      console.log('❌ Health check failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

// Test 2: Location Update
async function testLocationUpdate() {
  console.log('\n📍 Test 2: Location Update');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/location/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      userId: testUserId,
      ...testLocation
    });

    if (response.statusCode === 200) {
      console.log('✅ Location update successful');
      console.log('📍 Address:', response.data.location?.address);
      console.log('🏙️  City:', response.data.location?.city);
      console.log('🌍 Country:', response.data.location?.country);
      console.log('📊 History count:', response.data.historyCount);
      return true;
    } else {
      console.log('❌ Location update failed with status:', response.statusCode);
      console.log('📄 Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Location update error:', error.message);
    return false;
  }
}

// Test 3: Get Current Location
async function testGetCurrentLocation() {
  console.log('\n👤 Test 3: Get Current Location');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/location/current/${testUserId}`,
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Get current location successful');
      console.log('📍 Location:', response.data.location?.address);
      console.log('⏰ Timestamp:', response.data.location?.timestamp);
      return true;
    } else {
      console.log('❌ Get current location failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Get current location error:', error.message);
    return false;
  }
}

// Test 4: Start Tracking
async function testStartTracking() {
  console.log('\n🎯 Test 4: Start Tracking');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/location/tracking/start/${testUserId}`,
      method: 'POST'
    });

    if (response.statusCode === 200) {
      console.log('✅ Start tracking successful');
      console.log('⏱️  Interval:', response.data.interval, 'ms');
      return true;
    } else {
      console.log('❌ Start tracking failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Start tracking error:', error.message);
    return false;
  }
}

// Test 5: Multiple Location Updates (Simulate Real-Time)
async function testMultipleUpdates() {
  console.log('\n🔄 Test 5: Multiple Location Updates (Real-Time Simulation)');
  
  const locations = [
    { latitude: 40.7128, longitude: -74.0060 }, // New York
    { latitude: 40.7130, longitude: -74.0062 }, // Slightly different
    { latitude: 40.7132, longitude: -74.0064 }, // Another update
    { latitude: 40.7134, longitude: -74.0066 }, // Final update
  ];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 3002,
        path: '/api/location/update',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        userId: testUserId,
        ...location,
        accuracy: 10,
        timestamp: new Date().toISOString()
      });

      if (response.statusCode === 200) {
        console.log(`✅ Update ${i + 1}/${locations.length}: ${response.data.location?.address}`);
        
        // Simulate real-time delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`❌ Update ${i + 1} failed with status:`, response.statusCode);
        return false;
      }
    } catch (error) {
      console.log(`❌ Update ${i + 1} error:`, error.message);
      return false;
    }
  }

  console.log('✅ Multiple location updates completed successfully');
  return true;
}

// Test 6: Get Location History
async function testLocationHistory() {
  console.log('\n📚 Test 6: Get Location History');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/location/history/${testUserId}`,
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Get location history successful');
      console.log('📊 Total locations:', response.data.total);
      console.log('📍 Recent locations:');
      response.data.history.slice(-3).forEach((loc, index) => {
        console.log(`   ${index + 1}. ${loc.address} (${new Date(loc.timestamp).toLocaleTimeString()})`);
      });
      return true;
    } else {
      console.log('❌ Get location history failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Get location history error:', error.message);
    return false;
  }
}

// Test 7: Stop Tracking
async function testStopTracking() {
  console.log('\n⏹️  Test 7: Stop Tracking');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/location/tracking/stop/${testUserId}`,
      method: 'POST'
    });

    if (response.statusCode === 200) {
      console.log('✅ Stop tracking successful');
      return true;
    } else {
      console.log('❌ Stop tracking failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Stop tracking error:', error.message);
    return false;
  }
}

// Test 8: Get All Locations
async function testGetAllLocations() {
  console.log('\n👥 Test 8: Get All User Locations');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: '/api/location/all',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Get all locations successful');
      console.log('👥 Total users:', response.data.total);
      response.data.locations.forEach((user, index) => {
        console.log(`   ${index + 1}. User ${user.userId}: ${user.address}`);
      });
      return true;
    } else {
      console.log('❌ Get all locations failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Get all locations error:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SafeHer Location Tracking Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Location Update', fn: testLocationUpdate },
    { name: 'Get Current Location', fn: testGetCurrentLocation },
    { name: 'Start Tracking', fn: testStartTracking },
    { name: 'Multiple Updates', fn: testMultipleUpdates },
    { name: 'Location History', fn: testLocationHistory },
    { name: 'Stop Tracking', fn: testStopTracking },
    { name: 'Get All Locations', fn: testGetAllLocations }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} crashed:`, error.message);
      failedTests++;
    }
  }

  console.log('\n🎯 TEST RESULTS:');
  console.log(`✅ Passed: ${passedTests}/${tests.length}`);
  console.log(`❌ Failed: ${failedTests}/${tests.length}`);

  if (passedTests === tests.length) {
    console.log('\n🎉 ALL TESTS PASSED! Real-time location tracking is working correctly.');
    console.log('\n🌐 READY FOR USE:');
    console.log('1. Open your browser and go to the Live Location page');
    console.log('2. Click "Start Tracking"');
    console.log('3. Allow location access when prompted');
    console.log('4. Watch real-time location updates');
    console.log('5. See address geocoding and location history');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the error messages above.');
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Make sure the location server is running: node start-location-backend.js');
    console.log('2. Check that port 3002 is not blocked');
    console.log('3. Verify GPS is available on your device');
    console.log('4. Check browser location permissions');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
