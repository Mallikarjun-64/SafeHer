// Utility to make all data current with today's date
export const getCurrentDate = () => {
  const today = new Date();
  return {
    date: today.toISOString().split('T')[0],
    dateTime: today.toISOString(),
    localString: today.toLocaleString(),
    localTime: today.toLocaleTimeString()
  };
};

export const makeGuardianDataCurrent = (guardian: any) => {
  const current = getCurrentDate();
  return {
    ...guardian,
    addedDate: current.date,
    lastNotified: current.localString,
    status: 'active' as const
  };
};

export const makeAlertDataCurrent = (alert: any) => {
  const current = getCurrentDate();
  return {
    ...alert,
    created_at: current.dateTime,
    timestamp: current.localString,
    status: 'pending' as const
  };
};

export const getCurrentGuardians = () => {
  const current = getCurrentDate();
  return [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      relationship: 'Sister',
      address: '123 Main St, City, State 12345',
      status: 'active' as const,
      alerts: {
        sos: true,
        location: true,
        checkIn: true,
        emergency: true
      },
      priority: 'high' as const,
      addedDate: current.date,
      lastNotified: current.localString
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1-555-0124',
      relationship: 'Friend',
      address: '456 Oak Ave, City, State 12345',
      status: 'active' as const,
      alerts: {
        sos: true,
        location: false,
        checkIn: true,
        emergency: true
      },
      priority: 'medium' as const,
      addedDate: current.date,
      lastNotified: current.localString
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1-555-0125',
      relationship: 'Mother',
      address: '789 Pine St, City, State 12345',
      status: 'active' as const,
      alerts: {
        sos: true,
        location: true,
        checkIn: true,
        emergency: true
      },
      priority: 'high' as const,
      addedDate: current.date,
      lastNotified: current.localString
    }
  ];
};

export const getCurrentAlerts = () => {
  const current = getCurrentDate();
  const today = new Date();
  return [
    {
      id: 'alert_1',
      user_id: 'user_1',
      status: 'pending',
      latitude: 40.7128,
      longitude: -74.0060,
      created_at: current.dateTime,
      message: 'SOS triggered from SafeHer dashboard',
      type: 'emergency',
      location: 'New York, NY'
    },
    {
      id: 'alert_2',
      user_id: 'user_2',
      status: 'resolved',
      latitude: 34.0522,
      longitude: -118.2437,
      created_at: new Date(today.getTime() - 3600000).toISOString(), // 1 hour ago
      message: 'Check-in completed successfully',
      type: 'checkin',
      location: 'Los Angeles, CA'
    }
  ];
};

// Function to update existing data to current
export const updateDataToCurrent = () => {
  console.log('Updating all data to current date:', getCurrentDate().localString);
  
  // This can be called to refresh all demo data
  return {
    guardians: getCurrentGuardians(),
    alerts: getCurrentAlerts(),
    timestamp: getCurrentDate().dateTime
  };
};
