const express = require('express');
const router = express.Router();
const { verifyGST } = require('../Controller/gst-controller');
const { verifyPAN } = require('../Controller/pan-controller');

router
.post('/verifyGst', async (req, res) => {
    try {
        const { gst } = req.body;
        
        if (!gst) {
            return res.status(400).json({ 
                error: "GST number is required" 
            });
        }

        const result = await verifyGST(gst);
        
        if (result.success) {
            return res.status(200).json({
                verified: true,
                gst: result.data.gstNumber,
                businessName: result.data.businessName,
                status: result.data.status,
                message: result.message
            });
        } else {
            return res.status(422).json({ 
                error: result.message 
            });
        }
        
    } catch (error) {
        console.error('GST verification route error:', error);
        return res.status(500).json({ 
            error: "Verification service unavailable" 
        });
    }
})
.post('/verifyPan', async (req, res) => {
    try {
        const { pan, name } = req.body;
        
        if (!pan) {
            return res.status(400).json({ 
                error: "PAN number is required" 
            });
        }

        if (!name) {
            return res.status(400).json({ 
                error: "Name is required" 
            });
        }

        const result = await verifyPAN(pan, name);
        
        if (result.success) {
            return res.status(200).json({
                verified: true,
                pan: result.data.panNumber,
                name: result.data.name,
                message: result.message
            });
        } else {
            return res.status(422).json({ 
                error: result.message 
            });
        }
        
    } catch (error) {
        console.error('PAN verification route error:', error);
        return res.status(500).json({ 
            error: "Verification service unavailable" 
        });
    }
});

module.exports = router;