const express = require('express');
const router = express.Router();
const pool = require('../connection/db');

// Get Unified Content List
router.get('/contents', async (req, res) => {
    try {
        // Union query to get all content types for the Content Manager grid
        const query = `
            SELECT id, title, 'Article' as type, author_name as author, status, views, created_at as date, image_url as thumbnail_url, NULL as media_url FROM articles
            UNION ALL
            SELECT id, title, 'Video' as type, 'System' as author, status, views, upload_date as date, thumbnail_url, video_file_url as media_url FROM videos
            UNION ALL
            SELECT id, title, 'Podcast' as type, host as author, status, 0 as views, created_at as date, cover_image_url as thumbnail_url, audio_file_url as media_url FROM podcasts
            UNION ALL
            SELECT id, name as title, 'Business' as type, email as author, status, 0 as views, created_at as date, image_url as thumbnail_url, NULL as media_url FROM businesses
            ORDER BY date DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Single Content Details with Likes and Comments
router.get('/contents/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const typeLower = type.toLowerCase();

    let contentTable = '';
    let typeIdColumn = '';

    // Map types to DB tables
    switch (typeLower) {
        case 'article':
            contentTable = 'articles';
            typeIdColumn = 'article_id';
            break;
        case 'video':
            contentTable = 'videos';
            typeIdColumn = 'video_id';
            break;
        case 'podcast':
            contentTable = 'podcasts';
            typeIdColumn = 'podcast_id';
            break;
        case 'business':
            contentTable = 'businesses';
            break;
        default:
            return res.status(400).json({ message: 'Invalid content type' });
    }

    try {
        // 1. Fetch Main Content
        const contentResult = await pool.query(`SELECT * FROM ${contentTable} WHERE id = $1`, [id]);
        
        if (contentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Content not found' });
        }
        
        const contentData = contentResult.rows[0];
        let comments = [];
        let likes = [];

        // 2. Fetch Related Data
        if (typeLower === 'business') {
            // For Business: Fetch Reviews instead of standard comments
            const reviewsResult = await pool.query(`
                SELECT r.id, r.comment as text, r.rating, to_char(r.created_at, 'Mon DD, YYYY HH12:MI AM') as date, 
                       u.name as user, u.avatar_url as avatar
                FROM business_reviews r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.business_id = $1
                ORDER BY r.created_at DESC
            `, [id]);
            comments = reviewsResult.rows;
            // Businesses don't have a likes table in the schema provided, leaving empty
        } else {
            // For Content: Fetch Comments
            const commentsResult = await pool.query(`
                SELECT c.id, c.content as text, to_char(c.created_at, 'Mon DD, YYYY HH12:MI AM') as date, 
                       u.name as user, u.avatar_url as avatar
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.${typeIdColumn} = $1
                ORDER BY c.created_at DESC
            `, [id]);
            comments = commentsResult.rows;

            // Fetch Likes
            const likesResult = await pool.query(`
                SELECT l.created_at, u.name as user, u.avatar_url as avatar, u.role
                FROM likes l
                LEFT JOIN users u ON l.user_id = u.id
                WHERE l.${typeIdColumn} = $1
                ORDER BY l.created_at DESC
            `, [id]);
            likes = likesResult.rows;
        }

        // Return combined data
        res.json({
            ...contentData,
            commentsList: comments,
            likesList: likes,
            stats: {
                comments: comments.length,
                likes: likes.length
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Toggle Status for any content type
router.put('/:type/:id/status', async (req, res) => {
    const { type, id } = req.params;
    const { status } = req.body; // e.g., 'visible', 'hidden', 'suspended'
    
    let table = '';
    switch(type.toLowerCase()) {
        case 'article': table = 'articles'; break;
        case 'video': table = 'videos'; break;
        case 'podcast': table = 'podcasts'; break;
        case 'business': table = 'businesses'; break;
        default: return res.status(400).json({ message: 'Invalid type' });
    }

    try {
        await pool.query(`UPDATE ${table} SET status = $1 WHERE id = $2`, [status, id]);
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;