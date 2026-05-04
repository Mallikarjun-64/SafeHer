const http = require('http');

console.log('🧪 Testing SafeHer Backend Server...\n');

// Test data
const testGuardian = {
  guardianId: 'test_123',
  guardianName: 'Test Guardian',
  guardianPhone: '+1234567890',
  guardianEmail: 'test@example.com',
  message: 'Test alert from SafeHer: This is a test emergency notification.',
  alertType: 'test',
  timestamp: new Date().toISOString()
};

// Function to make HTTP request
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

// Test functions
async function testHealthCheck() {
  console.log('📊 Testing health check...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('📋 Server status:', response.data.status);
      console.log('💬 Message:', response.data.message);
      console.log('📈 Alerts processed:', response.data.alertsProcessed);
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

async function testAlertSending() {
  console.log('\n📡 Testing alert sending...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/alerts/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token'
      }
    }, testGuardian);

    if (response.statusCode === 200) {
      console.log('✅ Alert sending test passed');
      console.log('📤 Response:', response.data.message);
      console.log('🎯 Alert ID:', response.data.alertId);
      console.log('📊 Delivery status:', response.data.deliveryStatus);
      console.log('📈 Overall success:', response.data.success);
      return response.data;
    } else {
      console.log('❌ Alert sending failed with status:', response.statusCode);
      console.log('📄 Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Alert sending error:', error.message);
    return null;
  }
}

async function testGetAlerts() {
  console.log('\n📋 Testing get all alerts...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/alerts',
      method: 'GET'
    });

    if (response.statusCode === 200) {
      console.log('✅ Get alerts test passed');
      console.log('📊 Total alerts:', response.data.total);
      if (response.data.alerts.length > 0) {
        const lastAlert = response.data.alerts[response.data.alerts.length - 1];
        console.log('🕐 Last alert:', lastAlert.alertType, 'to', lastAlert.guardianName);
        console.log('📈 Status:', lastAlert.status);
      }
      return true;
    } else {
      console.log('❌ Get alerts failed with status:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Get alerts error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting backend tests...\n');

  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend server is not running or not accessible');
    console.log('💡 Please start the server first: node simple-server.js');
    return;
  }

  const alertResult = await testAlertSending();
  if (alertResult) {
    await testGetAlerts();
  }

  console.log('\n🎉 Backend tests completed!');
  console.log('💡 If all tests passed, the backend is ready for use');
  console.log('🌐 Now you can test the "Test Alert" button in the Guardian Management page');
}

// Check if server is running
runTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
