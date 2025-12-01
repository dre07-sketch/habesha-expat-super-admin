
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');

// Get Subscribers
router.get('/subscribers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM subscribers ORDER BY joined_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Subscriber


// Get Ads
router.get('/ads', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ads ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Deactivate Ad
router.put('/ads/:id/deactivate', async (req, res) => {
    try {
        await pool.query("UPDATE ads SET status = 'inactive' WHERE id = $1", [req.params.id]);
        res.json({ message: 'Ad deactivated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get News

module.exports = router;
