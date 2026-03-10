const express = require('express');
const router = express.Router();

// Assistant routes placeholder
// These routes can be expanded later for assistant-specific functionality

router.get('/health', (req, res) => {
    res.json({ status: 'Assistant service healthy' });
});

module.exports = router;
