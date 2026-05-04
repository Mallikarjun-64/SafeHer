import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  limit, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

class SOSService {
  // Get user's current location
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Get address using reverse geocoding
          const address = await this.reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            accuracy,
            address: address || 'Location unknown'
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Reverse geocoding to get address from coordinates
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  // Save user location to Firestore
  async saveUserLocation(userId: string, location: LocationData): Promise<void> {
    try {
      await addDoc(collection(db, 'users', userId, 'user_locations'), {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || '',
        accuracy: location.accuracy,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving location to Firestore:', error);
      throw error;
    }
  }

  // Get user's guardians from Firestore
  async getUserGuardians(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'users', userId, 'guardians'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching guardians from Firestore:', error);
      throw error;
    }
  }

  // Create emergency alert in Firestore
  async createEmergencyAlert(userId: string, location: LocationData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'emergency_alerts'), {
        status: 'active',
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || '',
        guardian_notifications_sent: false,
        emergency_services_notified: false,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating emergency alert in Firestore:', error);
      throw error;
    }
  }

  // Update emergency alert status in Firestore
  async updateAlertStatus(userId: string, alertId: string, status: 'resolved' | 'cancelled'): Promise<void> {
    try {
      const alertRef = doc(db, 'users', userId, 'emergency_alerts', alertId);
      await updateDoc(alertRef, { 
        status,
        resolvedAt: status === 'resolved' ? serverTimestamp() : null
      });
    } catch (error) {
      console.error('Error updating alert status in Firestore:', error);
      throw error;
    }
  }

  // Get active emergency alert for user from Firestore
  async getActiveAlert(userId: string): Promise<any | null> {
    try {
      const q = query(
        collection(db, 'users', userId, 'emergency_alerts'),
        where('status', '==', 'active'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const alertDoc = querySnapshot.docs[0];
      return { id: alertDoc.id, ...alertDoc.data() };
    } catch (error) {
      console.error('Error fetching active alert from Firestore:', error);
      return null;
    }
  }
}

export const sosService = new SOSService();

