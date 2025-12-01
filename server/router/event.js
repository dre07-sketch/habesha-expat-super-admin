
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');

// List Events
router.get('/events-get', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Get Event Participants
router.get('/:id/participants', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM event_attendees WHERE event_id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
