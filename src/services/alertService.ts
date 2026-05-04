// Define Guardian interface locally to avoid circular imports
export interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  alerts: {
    sos: boolean;
    location: boolean;
    checkIn: boolean;
    emergency: boolean;
  };
  priority: 'high' | 'medium' | 'low';
  addedDate: string;
  lastNotified?: string;
}

export interface AlertPayload {
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  message: string;
  alertType: 'test' | 'sos' | 'emergency';
  timestamp: string;
}

export interface AlertResponse {
  success: boolean;
  message: string;
  alertId?: string;
}

class AlertService {
  constructor() {
    console.log('AlertService initialized');
  }

  /**
   * Log test alert to console (was previously sent via SMS/Email)
   */
  async sendTestAlert(guardian: Guardian): Promise<AlertResponse> {
    try {
      const payload: AlertPayload = {
        guardianId: guardian.id,
        guardianName: guardian.name,
        guardianPhone: guardian.phone,
        guardianEmail: guardian.email,
        message: `Test alert for ${guardian.name}`,
        alertType: 'test',
        timestamp: new Date().toISOString()
      };

      console.log('Alert logged for guardian (SMS/Email disabled):', payload);

      return {
        success: true,
        message: `Test alert logged for ${guardian.name}.`,
        alertId: `test_${Date.now()}_${guardian.id}`
      };
    } catch (error) {
      console.error('Error logging test alert:', error);
      return {
        success: false,
        message: 'Failed to log test alert.'
      };
    }
  }

  /**
   * Log emergency alert and trigger backend email notifications
   */
  async sendEmergencyAlert(guardians: Guardian[], userInfo: { userId: string, userName?: string }, location?: { lat: number; lng: number }): Promise<AlertResponse[]> {
    // 1. Trigger backend email notifications
    try {
      fetch('http://localhost:3001/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.userId,
          userName: userInfo.userName,
          location: location
        })
      }).then(res => res.json())
        .then(data => console.log('Backend SOS response:', data))
        .catch(err => console.error('Backend SOS error:', err));
    } catch (err) {
      console.error('Error triggering backend SOS:', err);
    }

    // 2. Log to console for each guardian (legacy logic)
    const alertPromises = guardians.map(guardian => 
      this.sendEmergencyAlertToGuardian(guardian, location)
    );

    return Promise.all(alertPromises);
  }

  private async sendEmergencyAlertToGuardian(guardian: Guardian, location?: { lat: number; lng: number }): Promise<AlertResponse> {
    try {
      const payload: AlertPayload = {
        guardianId: guardian.id,
        guardianName: guardian.name,
        guardianPhone: guardian.phone,
        guardianEmail: guardian.email,
        message: `EMERGENCY ALERT. Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}.`,
        alertType: 'emergency',
        timestamp: new Date().toISOString()
      };

      console.log('Emergency alert logged for guardian:', payload);

      return {
        success: true,
        message: `Emergency alert triggered for ${guardian.name}.`,
        alertId: `emergency_${Date.now()}_${guardian.id}`
      };
    } catch (error) {
      console.error('Error logging emergency alert:', error);
      return {
        success: false,
        message: 'Failed to trigger emergency alert.'
      };
    }
  }
}

// Export singleton instance
export const alertService = new AlertService();
