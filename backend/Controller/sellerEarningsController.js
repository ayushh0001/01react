const SellerEarnings = require("../Model/sellerEarningsModel");
const Payout = require("../Model/payoutModel");

// Helper function to calculate date ranges
const getDateRange = (period) => {
    const now = new Date();
    let startDate, endDate = now;

    switch (period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            const weekStart = now.getDate() - now.getDay();
            startDate = new Date(now.setDate(weekStart));
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            return null;
    }
    return { startDate, endDate };
};

// 54. GET /api/v1/sellers/earnings - Returns seller's earnings history with filtering options
const getSellerEarnings = async (req, res) => {
    try {
        const sellerId = req.user.userId; // From JWT token
        const { 
            page = 1, 
            limit = 10, 
            status, 
            dateFrom, 
            dateTo, 
            period 
        } = req.query;

        // Build query
        let query = { sellerId };

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date range
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        // Filter by period
        if (period) {
            const dateRange = getDateRange(period);
            if (dateRange) {
                query.createdAt = {
                    $gte: dateRange.startDate,
                    $lte: dateRange.endDate
                };
            }
        }

        // Pagination
        const skip = (page - 1) * limit;
        const earnings = await SellerEarnings.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalEarnings = await SellerEarnings.countDocuments(query);

        // Calculate summary
        const summaryPipeline = [
            { $match: { sellerId: sellerId } },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$netAmount" },
                    pendingEarnings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, "$netAmount", 0]
                        }
                    },
                    processedEarnings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "processed"] }, "$netAmount", 0]
                        }
                    },
                    totalOrders: { $sum: 1 }
                }
            }
        ];

        const summaryResult = await SellerEarnings.aggregate(summaryPipeline);
        const summary = summaryResult[0] || {
            totalEarnings: 0,
            pendingEarnings: 0,
            processedEarnings: 0,
            totalOrders: 0
        };

        summary.averageEarningPerOrder = summary.totalOrders > 0 
            ? (summary.totalEarnings / summary.totalOrders).toFixed(2) 
            : 0;

        res.status(200).json({
            success: true,
            earnings,
            summary,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalEarnings / limit),
                totalItems: totalEarnings,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < Math.ceil(totalEarnings / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching seller earnings:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch earnings" 
        });
    }
};

// 55. GET /api/v1/sellers/earnings/summary - Returns earnings summary for different time periods
const getEarningsSummary = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const { period } = req.query;

        const summaries = {};

        // Define periods to calculate
        const periods = period ? [period] : ['today', 'week', 'month'];

        for (const p of periods) {
            const dateRange = getDateRange(p);
            if (!dateRange) continue;

            const pipeline = [
                {
                    $match: {
                        sellerId: sellerId,
                        createdAt: {
                            $gte: dateRange.startDate,
                            $lte: dateRange.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        grossAmount: { $sum: "$grossAmount" },
                        netAmount: { $sum: "$netAmount" },
                        orders: { $sum: 1 },
                        platformFee: { $sum: "$platformFee" },
                        paymentGatewayFee: { $sum: "$paymentGatewayFee" },
                        gstAmount: { $sum: "$gstAmount" }
                    }
                }
            ];

            const result = await SellerEarnings.aggregate(pipeline);
            summaries[p] = result[0] || {
                grossAmount: 0,
                netAmount: 0,
                orders: 0,
                platformFee: 0,
                paymentGatewayFee: 0,
                gstAmount: 0
            };
        }

        res.status(200).json({
            success: true,
            ...summaries
        });

    } catch (error) {
        console.error("Error fetching earnings summary:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch earnings summary" 
        });
    }
};

// 56. GET /api/v1/sellers/earnings/:orderId - Returns earnings details for a specific order
const getOrderEarnings = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const { orderId } = req.params;

        const earning = await SellerEarnings.findOne({ 
            sellerId, 
            orderId 
        });

        if (!earning) {
            return res.status(404).json({
                success: false,
                error: "Earning record not found for this order"
            });
        }

        // Calculate breakdown percentages
        const breakdown = {
            grossAmount: earning.grossAmount,
            platformFeeRate: ((earning.platformFee / earning.grossAmount) * 100).toFixed(2),
            platformFee: earning.platformFee,
            paymentGatewayFeeRate: ((earning.paymentGatewayFee / earning.grossAmount) * 100).toFixed(2),
            paymentGatewayFee: earning.paymentGatewayFee,
            gstRate: ((earning.gstAmount / earning.grossAmount) * 100).toFixed(2),
            gstAmount: earning.gstAmount,
            netAmount: earning.netAmount
        };

        // Mock order object (replace with actual order when Order model exists)
        const mockOrder = {
            orderId: earning.orderId,
            orderNumber: earning.orderNumber,
            status: "delivered",
            createdAt: earning.createdAt
        };

        res.status(200).json({
            success: true,
            earning,
            order: mockOrder,
            breakdown
        });

    } catch (error) {
        console.error("Error fetching order earnings:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch order earnings" 
        });
    }
};

// 57. GET /api/v1/sellers/payouts - Returns seller's payout history
const getPayouts = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const { page = 1, limit = 10, status } = req.query;

        let query = { sellerId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const payouts = await Payout.find(query)
            .sort({ requestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPayouts = await Payout.countDocuments(query);

        res.status(200).json({
            success: true,
            payouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPayouts / limit),
                totalItems: totalPayouts,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < Math.ceil(totalPayouts / limit),
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching payouts:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch payouts" 
        });
    }
};

// 58. POST /api/v1/sellers/payouts/request - Requests payout for processed earnings
const requestPayout = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const { amount, bankAccountId } = req.body;

        // Get all processed earnings for this seller
        const processedEarnings = await SellerEarnings.find({
            sellerId,
            status: 'processed'
        });

        if (processedEarnings.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No processed earnings available for payout"
            });
        }

        // Calculate total available amount
        const totalAvailable = processedEarnings.reduce((sum, earning) => sum + earning.netAmount, 0);
        const payoutAmount = amount || totalAvailable;

        if (payoutAmount > totalAvailable) {
            return res.status(400).json({
                success: false,
                error: `Insufficient funds. Available: ₹${totalAvailable}`
            });
        }

        // Create payout request
        const estimatedPayoutDate = new Date();
        estimatedPayoutDate.setDate(estimatedPayoutDate.getDate() + 3); // 3 days from now

        const payout = new Payout({
            sellerId,
            totalAmount: payoutAmount,
            earningsCount: processedEarnings.length,
            bankAccount: bankAccountId || "****1234", // Mock bank account
            estimatedPayoutDate
        });

        await payout.save();

        // Update earnings status to 'paid' (in real implementation, do this after actual payout)
        await SellerEarnings.updateMany(
            { sellerId, status: 'processed' },
            { 
                status: 'paid', 
                payoutDate: new Date(),
                payoutId: payout._id.toString()
            }
        );

        res.status(201).json({
            success: true,
            message: "Payout request submitted successfully",
            payout: {
                id: payout._id,
                amount: payout.totalAmount,
                status: payout.status,
                requestedAt: payout.requestedAt,
                estimatedPayoutDate: payout.estimatedPayoutDate
            }
        });

    } catch (error) {
        console.error("Error requesting payout:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to request payout" 
        });
    }
};

// Helper function to create mock earnings data (for testing)
const createMockEarnings = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        // Create some mock earnings data
        const mockEarnings = [
            {
                sellerId,
                orderId: "ORD001",
                orderNumber: "ORD-2025-001234",
                grossAmount: 2999.99,
                platformFee: 149.99,
                paymentGatewayFee: 59.99,
                gstAmount: 449.99,
                netAmount: 2340.02,
                status: 'processed'
            },
            {
                sellerId,
                orderId: "ORD002", 
                orderNumber: "ORD-2025-001235",
                grossAmount: 1500.00,
                platformFee: 75.00,
                paymentGatewayFee: 30.00,
                gstAmount: 225.00,
                netAmount: 1170.00,
                status: 'pending'
            },
            {
                sellerId,
                orderId: "ORD003",
                orderNumber: "ORD-2025-001236", 
                grossAmount: 5000.00,
                platformFee: 250.00,
                paymentGatewayFee: 100.00,
                gstAmount: 750.00,
                netAmount: 3900.00,
                status: 'paid'
            }
        ];

        await SellerEarnings.insertMany(mockEarnings);

        res.status(201).json({
            success: true,
            message: "Mock earnings data created successfully",
            count: mockEarnings.length
        });

    } catch (error) {
        console.error("Error creating mock earnings:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to create mock earnings" 
        });
    }
};

module.exports = {
    getSellerEarnings,
    getEarningsSummary,
    getOrderEarnings,
    getPayouts,
    requestPayout,
    createMockEarnings // For testing only
};