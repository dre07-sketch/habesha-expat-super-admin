
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');

// List Jobs
router.get('/', async (req, res) => {
    try {
        // Fetch jobs with applicant count
        const query = `
            SELECT j.*, COUNT(ja.id) as applicants_count 
            FROM jobs j 
            LEFT JOIN job_applicants ja ON j.id = ja.job_id 
            GROUP BY j.id 
            ORDER BY j.posted_date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});






// Toggle Job Visibility
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        // Simple toggle logic usually handled by UI sending exact status, but here we toggle in DB
        const result = await pool.query(`
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
        await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
