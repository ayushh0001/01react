/* 
 * DEVELOPMENT ONLY - PUBLIC LOCATION ROUTES
 * 
 * These routes are ONLY needed when you DON'T have Google Maps API key
 * 
 * WHEN YOU GET API KEY:
 * 1. DELETE this entire file
 * 2. Remove the import from index.js
 * 3. Remove the route registration from index.js
 * 
 * With API key, frontend will use browser GPS directly
 */

const express = require('express');
const { getUserLocationCoordinates } = require('../Controller/publicLocationController');

const router = express.Router();

// Public endpoint - no authentication required
// NOTE: This route will be REMOVED when you have Google Maps API key
router.post('/coordinates', getUserLocationCoordinates);

module.exports = router;