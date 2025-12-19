const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query } = require('../connection/db');

const storage = multer.diskStorage({
    destination: "upload/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// Get Subscribers
router.post('/ads-post', upload.single('mediaFile'), async (req, res) => {
    try {
        const { title, type, placement, url, durationValue } = req.body;

        const mediaFile = req.file ? `/upload/${req.file.filename}` : null;

        const sql = `
            INSERT INTO ads 
                (title, type, placement, destination_url, duration_days, media_file_url, status)
            VALUES
                ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING id
        `;

        const values = [
            title,
            type,
            placement,
            url,
            durationValue,
            mediaFile
        ];

        const result = await query(sql, values);

        res.status(201).json({
            success: true,
            message: 'Ad campaign active',
            id: result.rows[0].id
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


router.get('/ads-get', async (req, res) => {
    try {
        const baseURL = `${req.protocol}://${req.get("host")}`;
        const sql = `
            SELECT id, title, type, placement, 
            destination_url as url, duration_days as "durationDays", 
            media_file_url as "mediaFile", status 
            FROM ads 
            ORDER BY created_at DESC
        `;
        const { rows } = await query(sql);

        const formattedRows = rows.map(row => {
            let mediaFile = row.mediaFile;
            if (mediaFile && !mediaFile.startsWith('http')) {
                // Normalize path: clean potentially double slashes or leading slashes
                let cleanPath = mediaFile.replace(/\\/g, '/').replace(/^\/+/, '');

                // Ensure it targets the 'upload/' directory (singular)
                if (cleanPath.startsWith('uploads/')) {
                    cleanPath = cleanPath.replace('uploads/', 'upload/');
                } else if (!cleanPath.startsWith('upload/')) {
                    cleanPath = `upload/${cleanPath}`;
                }

                mediaFile = `${baseURL}/${cleanPath}`;
            }
            return {
                ...row,
                mediaFile
            };
        });

        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Ad Campaign
router.delete('/ads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await query(`DELETE FROM ads WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Ad campaign deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Ad Status (active/inactive)
router.put('/ads/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'inactive'

        // Optional validation
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        await query(`UPDATE ads SET status = $1 WHERE id = $2`, [status, id]);
        res.json({ success: true, message: `Ad campaign is now ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/subscribers-get', async (req, res) => {
    try {
        const sql = `
            SELECT id, email, name, status, source, plan, 
            joined_date as joinedDate 
            FROM subscribers 
            ORDER BY joined_date DESC
        `;
        const { rows } = await query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/newsletters-get', async (req, res) => {
    try {
        const sql = `
            SELECT id, subject, recipient_segment as segment, content, 
            image_url as image, status, sent_date as sentDate, 
            recipient_count as recipientCount, open_rate as openRate, 
            click_rate as clickRate 
            FROM newsletters 
            ORDER BY created_at DESC
        `;
        const { rows } = await query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get News

module.exports = router;
