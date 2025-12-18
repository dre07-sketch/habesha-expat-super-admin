const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query, DB_TYPE } = require('../connection/db');


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
  limits: { fileSize: 500 * 1024 * 1024 }, // Increased to 50MB for videos
  fileFilter: (req, file, cb) => {
    // Regex for images
    const imageAllowed = /jpeg|jpg|png|webp/;
    // Regex for videos
    const videoAllowed = /mp4|webm|ogg|mov/;

    const ext = path.extname(file.originalname).toLowerCase();

    // Check based on fieldname
    if (file.fieldname === 'image') {
      const isImage = imageAllowed.test(ext);
      // Optional: check mimetype as well
      if (isImage) return cb(null, true);
      cb(new Error('Only image files are allowed for the image field'));
    } else if (file.fieldname === 'video') {
      const isVideo = videoAllowed.test(ext);
      if (isVideo) return cb(null, true);
      cb(new Error('Only video files (mp4, webm, ogg, mov) are allowed for the video field'));
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});
const buildMediaURL = (path, baseURL) => {
  if (!path) return null;

  // already full URL (YouTube, Vimeo, CDN, etc.)
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  let cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', 'upload/');
  } else if (!cleanPath.startsWith('upload/')) {
    cleanPath = `upload/${cleanPath}`;
  }

  return `${baseURL}/${cleanPath}`;
};
// Additional routes for creating and updating articles can be added here
router.get("/articles-get", async (req, res) => {
  try {
    const baseURL = `${req.protocol}://${req.get("host")}`;

    const sql = `
      SELECT 
        id,
        title,
        slug,
        excerpt,
        content,
        image_url,
        category,
        author_name,
        status,
        views,
        publish_date,
        created_at,
        tags,
        url,
        video_url
      FROM articles
      ORDER BY publish_date DESC;
    `;

    const { rows } = await query(sql);

    const formatted = rows.map(article => {
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        author_name: article.author_name,
        status: article.status,
        views: article.views,
        publish_date: article.publish_date,
        created_at: article.created_at,
        tags: article.tags || [],
        url: article.url || null,
        image: buildMediaURL(article.image_url, baseURL),
        video_url: buildMediaURL(article.video_url, baseURL)
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });

  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Failed to fetch articles." });
  }
});


router.post('/toggle-status/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get current article
    const articleQuery = `
            SELECT status 
            FROM articles
            WHERE id = $1
        `;
    const articleResult = await query(articleQuery, [id]);

    if (articleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const currentStatus = articleResult.rows[0].status;

    // 2. Determine new status (using 'draft' for consistency)
    let newStatus = currentStatus === 'published' ? 'draft' : 'published';

    // 3. Update status (cast parameter to text to avoid type ambiguity)
    const updateQuery = `
            UPDATE articles
            SET status = $1::text
            WHERE id = $2
            RETURNING *;
        `;
    const updateResult = await query(updateQuery, [newStatus, id]);

    // Format the returned article with the correct image URL so the frontend doesn't crash
    const rawArticle = updateResult.rows[0];
    let finalImage = null;
    const baseURL = `${req.protocol}://${req.get("host")}`;

    if (rawArticle.image_url) {
      let cleanPath = rawArticle.image_url.replace(/\\/g, '/').replace(/^\/+/, '');
      if (cleanPath.startsWith('uploads/')) {
        cleanPath = cleanPath.replace('uploads/', 'upload/');
      } else if (!cleanPath.startsWith('upload/')) {
        cleanPath = `upload/${cleanPath}`;
      }
      finalImage = `${baseURL}/${cleanPath}`;
    }

    const formattedArticle = {
      ...rawArticle,
      image: finalImage
    };

    res.json({
      message: `Article status updated successfully`,
      article: formattedArticle
    });

  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: 'Server Error', error });
  }
});


router.get('/articles-catagories', async (req, res) => {
  try {
    const sql = "SELECT name FROM categories WHERE type = $1";
    const params = ['articles'];

    const result = await query(sql, params);

    // Handle result (supporting both pg native object or direct array)
    const rows = result.rows || result;

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching article categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

router.get('/articles/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
            SELECT 
                c.id,
                c.content,
                c.created_at,
                u.name AS user_name
            FROM comments c
            INNER JOIN users u ON u.id = c.user_id
            WHERE c.article_id = $1
            ORDER BY c.created_at DESC
        `;

    const result = await query(sql, [id]);

    return res.json({
      success: true,
      comments: result.rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article comments"
    });
  }
});

router.get('/articles/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
            SELECT 
                l.id,
                l.created_at,
                u.name AS user_name
            FROM likes l
            INNER JOIN users u ON u.id = l.user_id
            WHERE l.article_id = $1
            ORDER BY l.created_at DESC
        `;

    const result = await query(sql, [id]);

    return res.json({
      success: true,
      likes: result.rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article likes"
    });
  }
});

router.get('/articles/:id/full', async (req, res) => {
  try {
    const { id } = req.params;

    const articleSql = `
            SELECT id, title, slug, excerpt, content, image_url, 
                   category, author_name, status, views, publish_date 
            FROM articles 
            WHERE id = $1
        `;

    const commentsSql = `
            SELECT 
                c.id,
                c.content,
                c.created_at,
                u.name AS user_name
            FROM comments c
            INNER JOIN users u ON u.id = c.user_id
            WHERE c.article_id = $1
            ORDER BY c.created_at DESC
        `;

    const likesSql = `
            SELECT 
                l.id,
                l.created_at,
                u.name AS user_name
            FROM likes l
            INNER JOIN users u ON u.id = l.user_id
            WHERE l.article_id = $1
            ORDER BY l.created_at DESC
        `;

    const article = await query(articleSql, [id]);
    const comments = await query(commentsSql, [id]);
    const likes = await query(likesSql, [id]);

    return res.json({
      success: true,
      article: article.rows[0],
      comments: comments.rows,
      likes: likes.rows,
      likesCount: likes.rowCount,
      commentsCount: comments.rowCount
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article data"
    });
  }
});
router.delete("/articles-delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      "DELETE FROM articles WHERE id = $1 RETURNING id, title",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
      deleted: result.rows[0],
    });

  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;