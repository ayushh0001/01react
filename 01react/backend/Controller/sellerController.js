import { pool } from '../config/database.js';

// Save or update seller business details
export const saveBusinessDetails = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      businessName,
      businessDescription,
      businessType,
      gstNo,
      panNo,
      address,
      city,
      state,
      pincode
    } = req.body;

    // Validation
    if (!businessName || !pincode) {
      return res.status(400).json({
        success: false,
        error: 'Business name and pincode are required'
      });
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pincode format. Must be 6 digits.'
      });
    }

    // Check if business details already exist
    const existingQuery = 'SELECT id FROM seller_business_details WHERE user_id = $1';
    const existing = await pool.query(existingQuery, [userId]);

    let result;

    if (existing.rows.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE seller_business_details
        SET 
          business_name = $1,
          business_description = $2,
          business_type = $3,
          gst_no = $4,
          pan_no = $5,
          address = $6,
          city = $7,
          state = $8,
          pincode = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $10
        RETURNING *
      `;

      result = await pool.query(updateQuery, [
        businessName,
        businessDescription || null,
        businessType || 'general',
        gstNo || null,
        panNo || null,
        address || '',
        city || '',
        state || '',
        pincode,
        userId
      ]);
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO seller_business_details (
          user_id, business_name, business_description, business_type,
          gst_no, pan_no, address, city, state, pincode
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      result = await pool.query(insertQuery, [
        userId,
        businessName,
        businessDescription || null,
        businessType || 'general',
        gstNo || null,
        panNo || null,
        address || '',
        city || '',
        state || '',
        pincode
      ]);
    }

    res.json({
      success: true,
      message: 'Business details saved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Save business details error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint === 'seller_business_details_gst_no_key') {
        return res.status(400).json({
          success: false,
          error: 'GST number already registered'
        });
      }
      if (error.constraint === 'seller_business_details_pan_no_key') {
        return res.status(400).json({
          success: false,
          error: 'PAN number already registered'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save business details',
      details: error.message
    });
  }
};

// Get seller business details
export const getBusinessDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = 'SELECT * FROM seller_business_details WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Business details not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get business details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get business details'
    });
  }
};

// Save or update seller bank details
export const saveBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      accountType
    } = req.body;

    // Validation
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({
        success: false,
        error: 'Account holder name, account number, IFSC code, and bank name are required'
      });
    }

    // Validate IFSC code format
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IFSC code format'
      });
    }

    // Check if bank details already exist
    const existingQuery = 'SELECT id FROM seller_bank_details WHERE user_id = $1';
    const existing = await pool.query(existingQuery, [userId]);

    let result;

    if (existing.rows.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE seller_bank_details
        SET 
          account_holder_name = $1,
          account_no = $2,
          ifsc_code = $3,
          bank_name = $4,
          account_type = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $6
        RETURNING *
      `;

      result = await pool.query(updateQuery, [
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        accountType || 'savings',
        userId
      ]);
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO seller_bank_details (
          user_id, account_holder_name, account_no, ifsc_code,
          bank_name, account_type
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      result = await pool.query(insertQuery, [
        userId,
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        accountType || 'savings'
      ]);
    }

    res.json({
      success: true,
      message: 'Bank details saved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Save bank details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save bank details',
      details: error.message
    });
  }
};

// Get seller bank details
export const getBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = 'SELECT * FROM seller_bank_details WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bank details not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bank details'
    });
  }
};

// Get complete seller profile (user + business + bank details)
export const getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user basic info
    const userQuery = `
      SELECT id, user_name, name, mobile, email, user_role, is_verified, created_at
      FROM users
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Get business details
    const businessQuery = 'SELECT * FROM seller_business_details WHERE user_id = $1';
    const businessResult = await pool.query(businessQuery, [userId]);
    const businessDetails = businessResult.rows[0] || null;

    // Get bank details
    const bankQuery = 'SELECT * FROM seller_bank_details WHERE user_id = $1';
    const bankResult = await pool.query(bankQuery, [userId]);
    const bankDetails = bankResult.rows[0] || null;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          userName: user.user_name,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          userRole: user.user_role,
          isVerified: user.is_verified,
          createdAt: user.created_at
        },
        businessDetails: businessDetails ? {
          id: businessDetails.id,
          businessName: businessDetails.business_name,
          businessDescription: businessDetails.business_description,
          businessType: businessDetails.business_type,
          gstNo: businessDetails.gst_no,
          panNo: businessDetails.pan_no,
          address: businessDetails.address,
          city: businessDetails.city,
          state: businessDetails.state,
          pincode: businessDetails.pincode,
          isVerified: businessDetails.is_verified,
          createdAt: businessDetails.created_at
        } : null,
        bankDetails: bankDetails ? {
          id: bankDetails.id,
          accountHolderName: bankDetails.account_holder_name,
          accountNumber: bankDetails.account_no,
          ifscCode: bankDetails.ifsc_code,
          bankName: bankDetails.bank_name,
          accountType: bankDetails.account_type,
          createdAt: bankDetails.created_at
        } : null
      }
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get seller profile',
      details: error.message
    });
  }
};


// Get all customers for the seller — only those who ordered from this seller
export const getCustomers = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const result = await pool.query(`
      SELECT
        u.id,
        u.user_name,
        u.name,
        u.mobile,
        u.email,
        u.is_verified,
        u.is_active,
        u.created_at,
        COUNT(o.id)::int                          AS total_orders,
        MAX(o.created_at)                         AS last_order_date,
        COALESCE(SUM(o.final_amount), 0)::numeric AS total_spent
      FROM users u
      INNER JOIN orders o ON o.user_id = u.id AND o.seller_id = $1
      WHERE u.user_role = 'customer'
      GROUP BY u.id
      ORDER BY last_order_date DESC
    `, [sellerId]);

    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
};

// Get seller earnings
export const getEarnings = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { limit = 10, period = 'week' } = req.query;

    const query = `
      SELECT 
        se.*,
        o.order_number,
        u.name as customer_name
      FROM seller_earnings se
      LEFT JOIN orders o ON se.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE se.seller_id = $1
      ORDER BY se.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [sellerId, parseInt(limit)]);

    res.json({
      success: true,
      earnings: result.rows.map(row => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        grossAmount: parseFloat(row.gross_amount),
        platformFee: parseFloat(row.platform_fee),
        paymentGatewayFee: parseFloat(row.payment_gateway_fee),
        gstAmount: parseFloat(row.gst_amount),
        netAmount: parseFloat(row.net_amount),
        status: row.status,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch earnings'
    });
  }
};

// Get earnings summary
export const getEarningsSummary = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get lifetime earnings
    const lifetimeQuery = `
      SELECT 
        COALESCE(SUM(net_amount), 0) as total_earnings,
        COUNT(*) as order_count
      FROM seller_earnings
      WHERE seller_id = $1 AND status = 'processed'
    `;
    const lifetimeResult = await pool.query(lifetimeQuery, [sellerId]);

    // Get pending earnings
    const pendingQuery = `
      SELECT COALESCE(SUM(net_amount), 0) as pending_earnings
      FROM seller_earnings
      WHERE seller_id = $1 AND status = 'pending'
    `;
    const pendingResult = await pool.query(pendingQuery, [sellerId]);

    res.json({
      success: true,
      lifetime: {
        netAmount: parseFloat(lifetimeResult.rows[0].total_earnings),
        orderCount: parseInt(lifetimeResult.rows[0].order_count),
        tips: 0,
        bonus: 0
      },
      summary: {
        pendingEarnings: parseFloat(pendingResult.rows[0].pending_earnings)
      }
    });
  } catch (error) {
    console.error('Error fetching earnings summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch earnings summary'
    });
  }
};

// Request payout
export const requestPayout = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payout amount'
      });
    }

    // Check if seller has bank details
    const bankQuery = 'SELECT id FROM seller_bank_details WHERE user_id = $1';
    const bankResult = await pool.query(bankQuery, [sellerId]);

    if (bankResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please add bank details before requesting payout'
      });
    }

    // Check available balance
    const balanceQuery = `
      SELECT COALESCE(SUM(net_amount), 0) as available_balance
      FROM seller_earnings
      WHERE seller_id = $1 AND status = 'pending'
    `;
    const balanceResult = await pool.query(balanceQuery, [sellerId]);
    const availableBalance = parseFloat(balanceResult.rows[0].available_balance);

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance for payout'
      });
    }

    // Create payout request
    const payoutQuery = `
      INSERT INTO seller_payouts (
        seller_id,
        amount,
        status,
        bank_account_id
      )
      VALUES ($1, $2, 'pending', $3)
      RETURNING *
    `;

    const payoutResult = await pool.query(payoutQuery, [
      sellerId,
      amount,
      bankResult.rows[0].id
    ]);

    res.json({
      success: true,
      message: 'Payout request submitted successfully',
      data: payoutResult.rows[0]
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request payout'
    });
  }
};
