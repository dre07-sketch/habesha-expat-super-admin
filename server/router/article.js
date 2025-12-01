
const express = require('express');
const router = express.Router();
const pool = require('../connection/db');


router.get('/article-get', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/article-get/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Article not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/article-delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        res.json({ message: 'Article deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;