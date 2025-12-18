
const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');

// List Jobs
router.get('/jobs-get', async (req, res) => {
    try {
        const sql = `
      SELECT 
        id,
        title,
        company,
        location,
        type,
        salary,
        industry,
        description,
        responsibilities,
        requirements,
        benefits,
        status,
        posted_date AS "postedDate",
        url
      FROM jobs
      ORDER BY posted_date DESC
    `;

        const { rows } = await query(sql);

        res.status(200).json(rows);
    } catch (err) {
        console.error('❌ Error fetching jobs:', err);
        res.status(500).json({ error: err.message });
    }
});



// Toggle Job Visibility
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        // Simple toggle logic usually handled by UI sending exact status, but here we toggle in DB
        const result = await query(`
            UPDATE jobs 
            SET status = CASE WHEN status = 'visible' THEN 'hidden' ELSE 'visible' END 
            WHERE id = $1 RETURNING status
        `, [id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Job
router.delete('/job-delete/:id', async (req, res) => {
    try {
        await query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
