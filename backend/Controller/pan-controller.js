// PAN Verification Controller
// Handles both mock (development) and real (production) PAN verification

const verifyPAN = async (panNumber, userName) => {
  try {
    // Development Mode - Mock Response
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('🔧 Development Mode: Using Mock PAN Verification');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation logic
      if (!panNumber || panNumber.length !== 10) {
        return {
          success: false,
          message: 'Invalid PAN number format',
          data: null
        };
      }
      
      // Mock successful response
      return {
        success: true,
        message: 'PAN verified successfully',
        data: {
          panNumber: panNumber,
          name: userName || 'JOHN DOE', // Use provided name or default
          status: 'Valid',
          category: 'Individual',
          lastUpdated: '2024-01-15'
        }
      };
    }
    
    // Production Mode - Real API Call
    else {
      console.log('🚀 Production Mode: Using Real PAN API');
      
      // Replace with your actual PAN verification API
      const response = await fetch('https://api.pan-verification.com/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAN_API_KEY}`
        },
        body: JSON.stringify({
          pan_number: panNumber,
          name: userName // Include name in real API call
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'PAN verified successfully',
          data: result
        };
      } else {
        return {
          success: false,
          message: result.message || 'PAN verification failed',
          data: null
        };
      }
    }
    
  } catch (error) {
    console.error('PAN Verification Error:', error);
    return {
      success: false,
      message: 'PAN verification service unavailable',
      data: null
    };
  }
};

module.exports = {
  verifyPAN
};