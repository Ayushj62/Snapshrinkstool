interface UserData {
  fileName: string;
  fileType: string;
  fileSize: number;
  toolUsed: string;
  timestamp?: Date;
  userAgent?: string;
  screenResolution?: string;
  language?: string;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const collectUserData = async (data: UserData, hasConsent: boolean): Promise<void> => {
  if (!hasConsent) {
    return;
  }

  const enrichedData: UserData = {
    ...data,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...enrichedData,
        targetEmail: 'ayushjaiswal0970@gmail.com'
      })
    });

    if (!response.ok) {
      console.error('Failed to send analytics data');
    }
  } catch (error) {
    console.error('Error sending analytics data:', error);
  }
}; 