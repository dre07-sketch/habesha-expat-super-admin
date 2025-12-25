const express = require('express');
const router = express.Router();
const pool = require('../connection/db');
const multer = require('multer');
const path = require('path');
const { getImageUrl } = require('../utils/imageHelper');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../upload');
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        // 1. Define allowed extensions
        const imageAllowed = /jpeg|jpg|png|webp/;
        const videoAllowed = /mp4|webm|ogg|mov/;
        const audioAllowed = /mp3|wav|m4a|aac/; // Added for Podcasts

        // 2. Check based on fieldname
        if (file.fieldname === 'image' || file.fieldname === 'cover_image') {
            const isImage = imageAllowed.test(ext);
            if (isImage) return cb(null, true);
            cb(new Error('Only image files (jpg, png, webp) are allowed'));

        } else if (file.fieldname === 'video') {
            const isVideo = videoAllowed.test(ext);
            if (isVideo) return cb(null, true);
            cb(new Error('Only video files (mp4, webm, ogg, mov) are allowed'));

        } else if (file.fieldname === 'audio') {
            // Added Logic for Podcast Audio
            const isAudio = audioAllowed.test(ext);
            if (isAudio) return cb(null, true);
            cb(new Error('Only audio files (mp3, wav, m4a) are allowed'));

        } else {
            cb(new Error(`Unexpected field: ${file.fieldname}`));
        }
    }
});


router.get('/contents', async (req, res) => {
    try {
        const query = `
      -- VIDEOS
      SELECT 
        v.id, 
        v.title, 
        'Video' AS type, 
        'System' AS author, 
        v.status, 
        v.views, 
        v.upload_date AS date, 
        v.thumbnail_url, 
        v.video_file_url AS media_url,
        NULL::integer AS parent_id,
        NULL::numeric AS rating,
        NULL AS comment,
        NULL AS category,
        NULL AS phone,
        NULL AS address,
        NULL AS map_pin,
        NULL AS website_url,
        COALESCE(vc.comments_count, 0) AS comments_count,
        COALESCE(vl.likes_count, 0) AS likes_count
      FROM videos v
      LEFT JOIN (
        SELECT video_id, COUNT(*) AS comments_count
        FROM comments
        WHERE video_id IS NOT NULL
        GROUP BY video_id
      ) vc ON vc.video_id = v.id
      LEFT JOIN (
        SELECT video_id, COUNT(*) AS likes_count
        FROM likes
        WHERE video_id IS NOT NULL
        GROUP BY video_id
      ) vl ON vl.video_id = v.id

      UNION ALL

      -- PODCASTS
      SELECT 
        p.id, 
        p.title, 
        'Podcast' AS type, 
        p.host AS author, 
        p.status, 
        0 AS views, 
        p.created_at AS date, 
        p.cover_image_url AS thumbnail_url, 
        p.audio_file_url AS media_url,
        NULL::integer AS parent_id,
        NULL::numeric AS rating,
        NULL AS comment,
        NULL AS category,
        NULL AS phone,
        NULL AS address,
        NULL AS map_pin,
        NULL AS website_url,
        COALESCE(pc.comments_count, 0) AS comments_count,
        COALESCE(pl.likes_count, 0) AS likes_count
      FROM podcasts p
      LEFT JOIN (
        SELECT podcast_id, COUNT(*) AS comments_count
        FROM comments
        WHERE podcast_id IS NOT NULL
        GROUP BY podcast_id
      ) pc ON pc.podcast_id = p.id
      LEFT JOIN (
        SELECT podcast_id, COUNT(*) AS likes_count
        FROM likes
        WHERE podcast_id IS NOT NULL
        GROUP BY podcast_id
      ) pl ON pl.podcast_id = p.id

      UNION ALL

      -- BUSINESSES
      SELECT 
        b.id, 
        b.name AS title, 
        'Business' AS type, 
        b.email AS author, 
        b.status, 
        0 AS views, 
        b.created_at AS date, 
        b.image_url AS thumbnail_url, 
        NULL AS media_url,
        NULL::integer AS parent_id,
        b.rating,
        NULL AS comment,
        b.category,
        b.phone,
        b.address,
        b.map_pin,
        b.website_url,
        0 AS comments_count,
        0 AS likes_count
      FROM businesses b

      UNION ALL

      -- BUSINESS REVIEWS
      SELECT 
        r.id, 
        NULL AS title,
        'Review' AS type, 
        u.name AS author, 
        'visible' AS status, 
        0 AS views, 
        r.created_at AS date, 
        NULL AS thumbnail_url, 
        NULL AS media_url,
        r.business_id AS parent_id,
        r.rating,
        r.comment,
        NULL AS category,
        NULL AS phone,
        NULL AS address,
        NULL AS map_pin,
        NULL AS website_url,
        0 AS comments_count,
        0 AS likes_count
      FROM business_reviews r
      LEFT JOIN users u ON r.user_id = u.id

      ORDER BY date DESC
    `;

        const result = await pool.query(query);

        // Process rows to resolve image URLs
        const processedRows = result.rows.map(row => {
            const enhancedRow = { ...row };
            if (enhancedRow.thumbnail_url) {
                enhancedRow.thumbnail_url = getImageUrl(req, enhancedRow.thumbnail_url);
            }
            if (enhancedRow.media_url) {
                enhancedRow.media_url = getImageUrl(req, enhancedRow.media_url);
            }
            return enhancedRow;
        });

        res.json(processedRows);
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
    switch (type.toLowerCase()) {
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