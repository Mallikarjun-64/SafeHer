const http = require('http');
const url = require('url');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'config', 'services.env') });

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || 'localhost';

// In-memory database for locations (in production, use MongoDB/PostgreSQL)
const userLocations = new Map();
const locationHistory = new Map();
const activeTracking = new Map();

// Parse JSON body from request
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Geocoding service to get address from coordinates
async function reverseGeocode(lat, lng) {
  try {
    // Use OpenStreetMap Nominatim API (free)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SafeHer-Location-Service/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        address: data.display_name || 'Unknown Location',
        city: data.address?.city || data.address?.town || 'Unknown',
        country: data.address?.country || 'Unknown',
        postalCode: data.address?.postcode || '',
        formatted: data.display_name || `Lat: ${lat}, Lng: ${lng}`
      };
    } else {
      throw new Error('Geocoding failed');
    }
  } catch (error) {
    console.log('⚠️ Geocoding failed, using coordinates only');
    return {
      address: `Lat: ${lat}, Lng: ${lng}`,
      city: 'Unknown',
      country: 'Unknown',
      postalCode: '',
      formatted: `Lat: ${lat}, Lng: ${lng}`
    };
  }
}

// Calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Create HTTP server for location tracking
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  try {
    if (path === '/api/location/health' && req.method === 'GET') {
      // Health check endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'OK',
        message: 'SafeHer Location Tracking Service is running',
        timestamp: new Date().toISOString(),
        activeUsers: userLocations.size,
        totalLocations: locationHistory.size,
        services: {
          geocoding: 'OpenStreetMap Nominatim',
          database: 'In-Memory (Production: MongoDB)',
          tracking: 'Real-time GPS'
        }
      }));
      return;
    }

    if (path === '/api/location/update' && req.method === 'POST') {
      // Update user location
      const body = await parseBody(req);
      const { userId, latitude, longitude, accuracy, speed, heading, timestamp } = body;

      console.log(`📍 Location update from user ${userId}: ${latitude}, ${longitude}`);

      // Validate required fields
      if (!userId || !latitude || !longitude) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Missing required fields: userId, latitude, longitude'
        }));
        return;
      }

      // Get address from coordinates
      const locationData = await reverseGeocode(latitude, longitude);

      // Create location record
      const locationRecord = {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy || null,
        speed: speed || null,
        heading: heading || null,
        timestamp: timestamp || new Date().toISOString(),
        address: locationData.address,
        city: locationData.city,
        country: locationData.country,
        postalCode: locationData.postalCode,
        formatted: locationData.formatted
      };

      // Update current location
      userLocations.set(userId, locationRecord);

      // Add to location history
      if (!locationHistory.has(userId)) {
        locationHistory.set(userId, []);
      }
      const history = locationHistory.get(userId);
      history.push(locationRecord);
      
      // Keep only last 100 locations per user
      if (history.length > 100) {
        history.shift();
      }

      console.log(`✅ Location updated for user ${userId}: ${locationData.address}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Location updated successfully',
        location: locationRecord,
        historyCount: history.length
      }));
      return;
    }

    if (path === '/api/location/current/:userId' && req.method === 'GET') {
      // Get current location for specific user
      const userId = path.split('/').pop();
      const location = userLocations.get(userId);

      if (!location) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'No location found for user'
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        location: location,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (path === '/api/location/history/:userId' && req.method === 'GET') {
      // Get location history for specific user
      const userId = path.split('/').pop();
      const history = locationHistory.get(userId) || [];

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        userId,
        history: history.slice(-50), // Return last 50 locations
        total: history.length
      }));
      return;
    }

    if (path === '/api/location/all' && req.method === 'GET') {
      // Get all current user locations
      const allLocations = Array.from(userLocations.values());

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        locations: allLocations,
        total: allLocations.length,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (path === '/api/location/distance/:userId1/:userId2' && req.method === 'GET') {
      // Calculate distance between two users
      const pathParts = path.split('/');
      const userId1 = pathParts[3];
      const userId2 = pathParts[4];

      const loc1 = userLocations.get(userId1);
      const loc2 = userLocations.get(userId2);

      if (!loc1 || !loc2) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Location not found for one or both users'
        }));
        return;
      }

      const distance = calculateDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        userId1,
        userId2,
        distance: {
          meters: Math.round(distance),
          kilometers: Math.round(distance / 1000 * 100) / 100,
          miles: Math.round(distance / 1609.34 * 100) / 100
        },
        locations: {
          [userId1]: loc1,
          [userId2]: loc2
        }
      }));
      return;
    }

    if (path === '/api/location/tracking/start/:userId' && req.method === 'POST') {
      // Start tracking a user
      const userId = path.split('/').pop();
      activeTracking.set(userId, {
        startTime: new Date().toISOString(),
        interval: 5000 // 5 seconds
      });

      console.log(`🎯 Started tracking user ${userId}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Tracking started',
        userId,
        interval: 5000
      }));
      return;
    }

    if (path === '/api/location/tracking/stop/:userId' && req.method === 'POST') {
      // Stop tracking a user
      const userId = path.split('/').pop();
      const tracking = activeTracking.get(userId);

      if (tracking) {
        activeTracking.delete(userId);
        console.log(`⏹️ Stopped tracking user ${userId}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Tracking stopped',
        userId
      }));
      return;
    }

    if (path === '/api/location/tracking/status/:userId' && req.method === 'GET') {
      // Get tracking status for user
      const userId = path.split('/').pop();
      const tracking = activeTracking.get(userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        userId,
        isTracking: !!tracking,
        tracking: tracking || null
      }));
      return;
    }

    // 404 for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Endpoint not found',
      availableEndpoints: [
        'GET /api/location/health',
        'POST /api/location/update',
        'GET /api/location/current/:userId',
        'GET /api/location/history/:userId',
        'GET /api/location/all',
        'GET /api/location/distance/:userId1/:userId2',
        'POST /api/location/tracking/start/:userId',
        'POST /api/location/tracking/stop/:userId',
        'GET /api/location/tracking/status/:userId'
      ]
    }));

  } catch (error) {
    console.error('❌ Location Server Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: error.message
    }));
  }
});

// Start location server
server.listen(PORT, HOST, () => {
  console.log(`🚀 SafeHer Location Tracking Service running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/location/health`);
  console.log(`📍 Location update: POST http://${HOST}:${PORT}/api/location/update`);
  console.log(`👥 All locations: http://${HOST}:${PORT}/api/location/all`);
  console.log(`📈 Distance calculation: http://${HOST}:${PORT}/api/location/distance/user1/user2`);
  console.log('⚡ Real-time GPS tracking active!');
  console.log('🗺️  Geocoding via OpenStreetMap Nominatim');
  console.log('💾 In-memory database (Production: MongoDB)');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down location server...');
  server.close(() => {
    console.log('✅ Location server shut down gracefully');
    process.exit(0);
  });
});

module.exports = server;
