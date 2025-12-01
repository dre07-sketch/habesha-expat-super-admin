
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');
const bcrypt = require('bcrypt');

// Get Admins
router.get('/admins-get', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, role, status, updated_at as last_active FROM users WHERE role IN ('SuperAdmin', 'Admin', 'Editor', 'Moderator')");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Admin
router.post('/admins-post', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, 'Active') RETURNING id, name, email, role",
            [name, email, hash, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Admin Status
router.put('/admins/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Admin status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get System Status (Kill Switch State)
router.get('/system-status', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_status');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Public Website Status
router.put('/system-status/website', async (req, res) => {
    try {
        const { status } = req.body; // 'activated' or 'deactivated'
        
        const result = await pool.query(
            "UPDATE system_status SET status = $1, updated_at = NOW() WHERE service_name = 'Public Website' RETURNING *",
            [status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Admin Panel Status (Shutdown)
router.put('/system-status/admin', async (req, res) => {
    try {
        const { status } = req.body; // 'activated' or 'deactivated'
        
        const result = await pool.query(
            "UPDATE system_status SET status = $1, updated_at = NOW() WHERE service_name = 'Admin Panel' RETURNING *",
            [status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
