// routes/settings.js
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { getImageUrl } = require('../utils/imageHelper');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Authentication token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

const upload = require('../middleware/upload');


router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL that the frontend can use to display the image
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, path: req.file.path });
});



router.get('/admins-get', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role, status, avatar_url, created_at as last_active FROM administrators WHERE role IN ('Super-Admin', 'Admin', 'Editor', 'Moderator') ORDER BY id ASC"
        );

        // Process the rows to create valid Image URLs
        const admins = result.rows.map(admin => {
            if (admin.avatar_url) {
                // 1. Replace Windows backslashes (\) with Forward slashes (/)
                // 2. Remove 'public/' or './' if they exist at the start (cleanup)
                let cleanPath = admin.avatar_url.replace(/\\/g, '/');

                // 3. Construct the full URL using helper
                admin.avatar_url = getImageUrl(req, cleanPath);
            }
            return admin;
        });

        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching admins' });
    }
});


router.post('/admins-create', async (req, res) => {
    try {
        const { name, email, password, role, avatar_url } = req.body;

        // Check if user exists
        const userCheck = await pool.query("SELECT * FROM administrators WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Insert into DB
        const result = await pool.query(
            `INSERT INTO administrators 
                (name, email, password_hash, role, avatar_url, status, created_at) 
             VALUES 
                ($1, $2, $3, $4, $5, 'active', NOW()) 
             RETURNING id, name, email, role, avatar_url, status, created_at`,
            [name, email, hash, role, avatar_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.put('/admins/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // Expects 'active' or 'suspended'

        await pool.query(
            'UPDATE administrators SET status = $1 WHERE id = $2',
            [status, req.params.id]
        );
        res.json({ message: `Admin status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/system-status', async (req, res) => {
    try {
        // Ensure table has rows, otherwise insert defaults (Safety check)
        const check = await pool.query('SELECT count(*) FROM system_status');
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query("INSERT INTO system_status (service_name, status) VALUES ('Public Website', 'activated'), ('Admin Panel', 'activated')");
        }

        const result = await pool.query('SELECT * FROM system_status');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/system-status/website', async (req, res) => {
    try {
        const { status } = req.body; // 'activated' or 'deactivated'

        const result = await pool.query(
            "UPDATE system_status SET status = $1, updated_at = NOW() WHERE service_name = 'Public Website' RETURNING *",
            [status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.put('/system-status/admin', async (req, res) => {
    try {
        const { status } = req.body; // 'activated' or 'deactivated'

        const result = await pool.query(
            "UPDATE system_status SET status = $1, updated_at = NOW() WHERE service_name = 'Admin Panel' RETURNING *",
            [status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.put('/settings/account', authenticateToken, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get admin ID from the authenticated request
        const adminId = req.user.id;

        let sql, params;

        if (password) {
            // Update both email and password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            sql = `UPDATE administrators SET email = $1, password_hash = $2 WHERE id = $3`;
            params = [email, passwordHash, adminId];
        } else {
            // Update only email
            sql = `UPDATE administrators SET email = $1 WHERE id = $2`;
            params = [email, adminId];
        }

        await pool.query(sql, params);
        res.json({ success: true, message: 'Account settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/me", authenticateToken, async (req, res) => {
    try {
        // Get admin ID from the authenticated request (added by authenticateToken middleware)
        const adminId = req.user.id;

        const sql = `
      SELECT id, name, email, role, avatar_url, status, created_at
      FROM administrators
      WHERE id = $1
      LIMIT 1
    `;

        const { rows } = await pool.query(sql, [adminId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const admin = rows[0];
        if (admin.avatar_url) {
            let cleanPath = admin.avatar_url.replace(/\\/g, '/');
            admin.avatar_url = getImageUrl(req, cleanPath);
        }

        res.json(admin);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;