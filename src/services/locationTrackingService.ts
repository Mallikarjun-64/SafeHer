// Continuous Location Tracking Service for SafeHer
export interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  mapsLink: string;
}

class LocationTrackingService {
  private trackingInterval: number | null = null;
  private isTracking: boolean = false;
  private currentPosition: GeolocationPosition | null = null;
  private listeners: Set<(location: LocationData) => void> = new Set();
  private readonly TRACKING_INTERVAL_MS = 30000; // Track every 30 seconds
  private readonly POSITION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  constructor() {
    console.log('LocationTrackingService initialized');
    console.log('Geolocation supported:', !!navigator.geolocation);
  }

  /**
   * Start tracking location when user logs in
   */
  startTracking(userId: string): void {
    console.log('=== LOCATION TRACKING START ===');
    console.log('User ID:', userId);
    console.log('Currently tracking:', this.isTracking);
    
    if (this.isTracking) {
      console.log('Location tracking already active, skipping');
      return;
    }

    console.log(`Starting location tracking for user: ${userId}`);
    this.isTracking = true;

    // Request location permission first
    console.log('Requesting location permission...');
    this.requestLocationPermission().then((permissionGranted) => {
      console.log('Permission granted:', permissionGranted);
      if (permissionGranted) {
        // Get initial position immediately
        console.log('Getting initial position...');
        this.getCurrentPosition(userId);

        // Start periodic tracking
        console.log('Starting periodic tracking every', this.TRACKING_INTERVAL_MS / 1000, 'seconds');
        this.trackingInterval = window.setInterval(() => {
          console.log('Periodic location update triggered');
          this.getCurrentPosition(userId);
        }, this.TRACKING_INTERVAL_MS);

        console.log('Location tracking started successfully');
      } else {
        console.warn('Location permission denied, tracking disabled');
        this.isTracking = false;
      }
    });
  }

  /**
   * Stop tracking location when user logs out
   */
  stopTracking(): void {
    if (!this.isTracking) {
      console.log('Location tracking not active');
      return;
    }

    console.log('Stopping location tracking');
    this.isTracking = false;

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    this.currentPosition = null;
    console.log('Location tracking stopped');
  }

  /**
   * Get current GPS position
   */
  private getCurrentPosition(userId: string): void {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported by browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentPosition = position;
        const locationData: LocationData = {
          userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: new Date().toISOString(),
          mapsLink: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
        };

        console.log('Location captured:', locationData);
        this.notifyListeners(locationData);
        this.storeLocation(locationData);
      },
      (error) => {
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.code === 1,
          POSITION_UNAVAILABLE: error.code === 2,
          TIMEOUT: error.code === 3
        });
        
        // Create error location data
        const errorLocationData: LocationData = {
          userId,
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: new Date().toISOString(),
          mapsLink: 'https://maps.google.com/'
        };
        
        this.notifyListeners(errorLocationData);
      },
      this.POSITION_OPTIONS
    );
  }

  /**
   * Store location data in database
   */
  private async storeLocation(locationData: LocationData): Promise<void> {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      // Only store if we have valid location data
      if (locationData.latitude === 0 && locationData.longitude === 0) {
        console.log('Skipping database storage for invalid location data');
        return;
      }
      
      // Store location in user_locations sub-collection
      const locationRecord = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        mapsLink: locationData.mapsLink,
        timestamp: locationData.timestamp,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', locationData.userId, 'user_locations'), locationRecord);
      console.log('Location data stored successfully in Firestore');
    } catch (error) {
      console.error('Error storing location:', error);
    }
  }

  /**
   * Subscribe to location updates
   */
  subscribe(listener: (location: LocationData) => void): () => void {
    this.listeners.add(listener);
    console.log('Location listener added. Total listeners:', this.listeners.size);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      console.log('Location listener removed. Total listeners:', this.listeners.size);
    };
  }

  /**
   * Notify all listeners of location update
   */
  private notifyListeners(locationData: LocationData): void {
    this.listeners.forEach(listener => {
      try {
        listener(locationData);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  /**
   * Get current tracking status
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get current position
   */
  getCurrentPositionData(): GeolocationPosition | null {
    return this.currentPosition;
  }

  /**
   * Request location permission
   */
  requestLocationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          console.log('Location permission granted');
          resolve(true);
        },
        (error) => {
          console.error('Location permission denied:', error);
          resolve(false);
        },
        this.POSITION_OPTIONS
      );
    });
  }
}

// Export singleton instance
export const locationTrackingService = new LocationTrackingService();
