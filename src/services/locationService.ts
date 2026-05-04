// Real Location Service for SafeHer
export interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  formatted: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  message: string;
  location?: LocationData;
  historyCount?: number;
}

export interface LocationHistoryResponse {
  success: boolean;
  userId: string;
  history: LocationData[];
  total: number;
}

export interface DistanceResponse {
  success: boolean;
  userId1: string;
  userId2: string;
  distance: {
    meters: number;
    kilometers: number;
    miles: number;
  };
  locations: {
    [userId: string]: LocationData;
  };
}

class LocationService {
  private baseUrl: string;
  private trackingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Use location backend server
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-api-domain.com/api/location' 
      : 'http://localhost:3002/api/location';
    
    console.log('LocationService initialized with base URL:', this.baseUrl);
    
    // Test connection immediately
    this.testConnection();
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET'
      });
      
      if (response.ok) {
        console.log('✅ Location backend connection successful');
        return true;
      } else {
        console.warn('⚠️ Location backend responded with error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Location backend connection failed:', error.message);
      console.log('💡 Make sure the location server is running on port 3002');
      console.log('💡 Run: node start-location-backend.js');
      return false;
    }
  }

  /**
   * Update user location in real-time
   */
  async updateLocation(userId: string, position: GeolocationPosition): Promise<LocationUpdateResponse> {
    const locationData = {
      userId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      timestamp: new Date().toISOString()
    };

    console.log('📍 Sending location update:', locationData);

    // Retry logic for better reliability
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Location updated successfully (attempt ${attempt}):`, result.location?.address);
          return result;
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = new Error(errorData.message || `HTTP ${response.status}`);
          console.warn(`⚠️ Location update attempt ${attempt} failed:`, lastError.message);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Location update attempt ${attempt} error:`, lastError.message);
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`🔄 Retrying location update in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All attempts failed
    console.error('❌ Location update failed after all retries:', lastError?.message);
    return {
      success: false,
      message: lastError?.message || 'Location service unavailable after multiple attempts'
    };
  }

  /**
   * Get current location for a user
   */
  async getCurrentLocation(userId: string): Promise<LocationData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/current/${userId}`);
      
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.location : null;
      } else {
        console.error('❌ Failed to get current location');
        return null;
      }
    } catch (error) {
      console.error('❌ Get current location error:', error);
      return null;
    }
  }

  /**
   * Get location history for a user
   */
  async getLocationHistory(userId: string): Promise<LocationData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${userId}`);
      
      if (response.ok) {
        const result: LocationHistoryResponse = await response.json();
        return result.success ? result.history : [];
      } else {
        console.error('❌ Failed to get location history');
        return [];
      }
    } catch (error) {
      console.error('❌ Get location history error:', error);
      return [];
    }
  }

  /**
   * Get all current user locations
   */
  async getAllLocations(): Promise<LocationData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/all`);
      
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.locations : [];
      } else {
        console.error('❌ Failed to get all locations');
        return [];
      }
    } catch (error) {
      console.error('❌ Get all locations error:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two users
   */
  async calculateDistance(userId1: string, userId2: string): Promise<DistanceResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/distance/${userId1}/${userId2}`);
      
      if (response.ok) {
        const result: DistanceResponse = await response.json();
        return result.success ? result : null;
      } else {
        console.error('❌ Failed to calculate distance');
        return null;
      }
    } catch (error) {
      console.error('❌ Calculate distance error:', error);
      return null;
    }
  }

  /**
   * Start real-time tracking for a user
   */
  async startTracking(userId: string, options: {
    interval?: number;
    onLocationUpdate?: (location: LocationData) => void;
    onError?: (error: string) => void;
  } = {}): Promise<boolean> {
    try {
      const { interval = 5000, onLocationUpdate, onError } = options;

      // Start tracking on backend
      const response = await fetch(`${this.baseUrl}/tracking/start/${userId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start tracking on backend');
      }

      // Clear existing tracking for this user
      this.stopTracking(userId);

      // Start real-time location updates
      const trackingInterval = setInterval(async () => {
        try {
          // Get current GPS position
          const position = await this.getCurrentPosition();
          
          // Update location on backend
          const updateResult = await this.updateLocation(userId, position);
          
          if (updateResult.success && updateResult.location && onLocationUpdate) {
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

      console.log(`🎯 Started real-time tracking for user ${userId} (interval: ${interval}ms)`);
      return true;

    } catch (error) {
      console.error('❌ Start tracking error:', error);
      return false;
    }
  }

  /**
   * Stop tracking for a user
   */
  async stopTracking(userId: string): Promise<void> {
    try {
      // Clear interval
      const interval = this.trackingIntervals.get(userId);
      if (interval) {
        clearInterval(interval);
        this.trackingIntervals.delete(userId);
      }

      // Stop tracking on backend
      await fetch(`${this.baseUrl}/tracking/stop/${userId}`, {
        method: 'POST'
      });

      console.log(`⏹️ Stopped tracking for user ${userId}`);
    } catch (error) {
      console.error('❌ Stop tracking error:', error);
    }
  }

  /**
   * Get tracking status for a user
   */
  async getTrackingStatus(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/status/${userId}`);
      
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.isTracking : false;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ Get tracking status error:', error);
      return false;
    }
  }

  /**
   * Get current GPS position from browser
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Watch position changes (continuous updates)
   */
  watchPosition(callback: (position: GeolocationPosition) => void, errorCallback?: (error: GeolocationPositionError) => void): number {
    if (!navigator.geolocation) {
      if (errorCallback) {
        errorCallback({ code: 1, message: 'Geolocation not supported' } as GeolocationPositionError);
      }
      return -1;
    }

    return navigator.geolocation.watchPosition(
      callback,
      errorCallback || (() => {}),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Clear position watch
   */
  clearWatch(watchId: number): void {
    if (navigator.geolocation && watchId !== -1) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Check location service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Location service health check failed:', error);
      return false;
    }
  }

  /**
   * Stop all tracking intervals
   */
  stopAllTracking(): void {
    this.trackingIntervals.forEach((interval, userId) => {
      clearInterval(interval);
      this.stopTracking(userId);
    });
    this.trackingIntervals.clear();
  }
}

// Export singleton instance
export const locationService = new LocationService();
