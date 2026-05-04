// API endpoint for user location data

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
}

export interface LocationData {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
}

// Mock location data for demo purposes
const mockLocationData: { [key: string]: LocationData } = {
  'user1': {
    userId: 'user1',
    userName: 'John Doe',
    latitude: 40.7128,
    longitude: -74.0060,
    timestamp: new Date().toISOString(),
    accuracy: 10
  },
  'user2': {
    userId: 'user2',
    userName: 'Jane Smith',
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: new Date().toISOString(),
    accuracy: 15
  },
  'user3': {
    userId: 'user3',
    userName: 'Alice Johnson',
    latitude: 51.5074,
    longitude: -0.1278,
    timestamp: new Date().toISOString(),
    accuracy: 8
  }
};

export const getUserLocation = async (userId: string): Promise<LocationData | null> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data or null if user not found
    return mockLocationData[userId] || null;
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
};

export const updateUserLocation = async (userId: string, latitude: number, longitude: number): Promise<LocationData | null> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get user data from localStorage to get user name
    const currentUser = localStorage.getItem('currentUser');
    let userName = 'Unknown User';
    
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      userName = userData.full_name || 'Unknown User';
    }
    
    const locationData: LocationData = {
      userId,
      userName,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      accuracy: Math.floor(Math.random() * 10) + 5 // Random accuracy between 5-15 meters
    };
    
    // Update mock data
    mockLocationData[userId] = locationData;
    
    return locationData;
  } catch (error) {
    console.error('Error updating user location:', error);
    return null;
  }
};
