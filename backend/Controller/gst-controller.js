// GST Verification Controller
// Handles both mock (development) and real (production) GST verification

const verifyGST = async (gstNumber) => {
  try {
    // Development Mode - Mock Response
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('🔧 Development Mode: Using Mock GST Verification');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation logic
      if (!gstNumber || gstNumber.length !== 15) {
        return {
          success: false,
          message: 'Invalid GST number format',
          data: null
        };
      }
      
      // Mock successful response
      return {
        success: true,
        message: 'GST verified successfully',
        data: {
          gstNumber: gstNumber,
          businessName: 'Mock Business Pvt Ltd',
          status: 'Active',
          registrationDate: '2020-01-15',
          address: 'Mock Address, City - 123456'
        }
      };
    }
    
    // Production Mode - Real API Call
    else {
      console.log('🚀 Production Mode: Using Real GST API');
      
      // Replace with your actual GST verification API
      const response = await fetch('https://api.gst-verification.com/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GST_API_KEY}`
        },
        body: JSON.stringify({
          gst_number: gstNumber
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'GST verified successfully',
          data: result
        };
      } else {
        return {
          success: false,
          message: result.message || 'GST verification failed',
          data: null
        };
      }
    }
    
  } catch (error) {
    console.error('GST Verification Error:', error);
    return {
      success: false,
      message: 'GST verification service unavailable',
      data: null
    };
  }
};

module.exports = {
  verifyGST
};