// routes/settings.js
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- UPLOAD ENDPOINT ---
// Frontend calls this first to get the URL
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL that the frontend can use to display the image
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, path: req.file.path });
});

// --- ADMIN MANAGEMENT ENDPOINTS ---

// Get Admins
router.get('/admins-get', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role, status, avatar_url, created_at as last_active FROM administrators WHERE role IN ('SuperAdmin', 'Admin', 'Editor', 'Moderator') ORDER BY id ASC"
        );

        // Process the rows to create valid Image URLs
        const admins = result.rows.map(admin => {
            if (admin.avatar_url) {
                // 1. Replace Windows backslashes (\) with Forward slashes (/)
                // 2. Remove 'public/' or './' if they exist at the start (cleanup)
                let cleanPath = admin.avatar_url.replace(/\\/g, '/');

                // 3. Construct the full URL
                // Result example: http://localhost:5000/uploads/12345.jpg
                admin.avatar_url = `${req.protocol}://${req.get('host')}/${cleanPath}`;
            }
            return admin;
        });

        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching admins' });
    }
});

// Create Admin
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

// Toggle Admin Status (Suspend/Activate)
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

// --- SYSTEM KILL SWITCH ENDPOINTS ---

// Get System Status
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
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update Admin Panel Status
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

module.exports = router;