const express = require('express');
const router = express.Router();
const { query, DB_TYPE } = require('../connection/db');

// ------------------------
//  DASHBOARD SUMMARY
// ------------------------
router.get('/summary', async (req, res) => {
    try {
        const sql = `
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM articles WHERE status = 'published') AS articles,
        (SELECT COUNT(*) FROM videos WHERE status = 'visible') AS videos,
        (SELECT COUNT(*) FROM podcasts WHERE status = 'visible') AS podcasts,
        (SELECT COUNT(*) FROM events WHERE status <> 'hidden') AS events,
        (SELECT COUNT(*) FROM businesses WHERE status <> 'hidden') AS businesses,
        (SELECT COUNT(*) FROM jobs WHERE status = 'visible') AS jobs,
        (SELECT COUNT(*) FROM subscribers WHERE status = 'active') AS subscribers
    `;

        const { rows } = await query(sql);
        const data = rows[0];

        res.json({
            success: true,
            data: {
                users: parseInt(data.users || '0', 10),
                articles: parseInt(data.articles || '0', 10),
                videos: parseInt(data.videos || '0', 10),
                podcasts: parseInt(data.podcasts || '0', 10),
                events: parseInt(data.events || '0', 10),
                businesses: parseInt(data.businesses || '0', 10),
                jobs: parseInt(data.jobs || '0', 10),
                subscribers: parseInt(data.subscribers || '0', 10)
            }
        });
    } catch (err) {
        console.error("❌ Error summary:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ------------------------
//  MONTHLY GROWTH
// ------------------------
router.get('/growth', async (req, res) => {
    const months = parseInt(req.query.months || '7', 10);

    try {
        const sql = `
      WITH months AS (
        SELECT 
          to_char(date_trunc('month', (CURRENT_DATE - (n || ' months')::interval)), 'Mon') AS month_label,
          date_trunc('month', (CURRENT_DATE - (n || ' months')::interval)) AS month_start
        FROM generate_series($1-1, 0, -1) AS n
      ),

      users_by_month AS (
        SELECT date_trunc('month', created_at) AS m, COUNT(*) AS cnt
        FROM users
        GROUP BY 1
      ),

      articles_by_month AS (
        SELECT date_trunc('month', created_at) AS m, COUNT(*) AS cnt
        FROM articles
        WHERE status = 'published'
        GROUP BY 1
      ),

      businesses_by_month AS (
        SELECT date_trunc('month', created_at) AS m, COUNT(*) AS cnt
        FROM businesses
        GROUP BY 1
      ),

      videos_by_month AS (
        SELECT date_trunc('month', upload_date) AS m, COUNT(*) AS cnt
        FROM videos
        WHERE status = 'visible'
        GROUP BY 1
      ),

      podcasts_by_month AS (
        SELECT date_trunc('month', created_at) AS m, COUNT(*) AS cnt
        FROM podcasts
        WHERE status = 'visible'
        GROUP BY 1
      )

      SELECT 
        months.month_label AS name,
        COALESCE(u.cnt, 0) AS users,
        COALESCE(a.cnt, 0) AS articles,
        COALESCE(b.cnt, 0) AS businesses,
        COALESCE(v.cnt, 0) AS videos,
        COALESCE(p.cnt, 0) AS podcasts
      FROM months
      LEFT JOIN users_by_month u ON u.m = months.month_start
      LEFT JOIN articles_by_month a ON a.m = months.month_start
      LEFT JOIN businesses_by_month b ON b.m = months.month_start
      LEFT JOIN videos_by_month v ON v.m = months.month_start
      LEFT JOIN podcasts_by_month p ON p.m = months.month_start
      ORDER BY months.month_start;
    `;

        const { rows } = await query(sql, [months]);
        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("❌ Error growth:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});




router.get('/membership', async (req, res) => {
    try {
        // 1. Get total users count
        const totalResult = await query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(totalResult.rows[0].count);

        // 2. Get counts grouped by location (Top 5) for Pie Chart
        const locationResult = await query(`
            SELECT 
                COALESCE(NULLIF(location, ''), 'Unknown') as location_name, 
                COUNT(*) as count
            FROM users
            GROUP BY location_name
            ORDER BY count DESC
        `);

        // 3. Get counts specific to Roles (Free, Member, Author)
        // Adjust logic: assuming 'free' is default/null, and specific roles for others
        const rolesResult = await query(`
            SELECT
                COUNT(*) FILTER (WHERE role ILIKE 'member') AS member_count,
                COUNT(*) FILTER (WHERE role ILIKE 'author') AS author_count,
                COUNT(*) FILTER (WHERE role IS NULL OR role = '' OR role ILIKE 'free' OR role ILIKE 'user') AS free_count
            FROM users
        `);

        const { member_count, author_count, free_count } = rolesResult.rows[0];

        // 4. Process Location Data (Top 4 + Others)
        let distribution = [];
        let processedCount = 0;
        const topLimit = 4;
        const rows = locationResult.rows;

        for (let i = 0; i < Math.min(rows.length, topLimit); i++) {
            const count = parseInt(rows[i].count);
            distribution.push({
                name: rows[i].location_name,
                value: count,
                percentage: Math.round((count / totalUsers) * 100)
            });
            processedCount += count;
        }

        if (processedCount < totalUsers) {
            const otherCount = totalUsers - processedCount;
            distribution.push({
                name: 'Others',
                value: otherCount,
                percentage: Math.round((otherCount / totalUsers) * 100)
            });
        }

        res.json({
            success: true,
            data: {
                total: totalUsers,
                distribution: distribution,
                // New Role Data
                roles: {
                    free: parseInt(free_count),
                    member: parseInt(member_count),
                    author: parseInt(author_count)
                },
                trends: {
                    active_regions: rows.length,
                    // Mock trends for the UI
                    free_growth: "+5%",
                    member_growth: "+12%",
                    author_growth: "+3%"
                }
            }
        });

    } catch (err) {
        console.error("❌ Error fetching membership data:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ------------------------
//  CONTENT ENGAGEMENT
// ------------------------
router.get('/engagement', async (req, res) => {
    try {
        const articles = await query(`
      SELECT a.id, a.title, a.views, a.image_url,
        COALESCE(c.comment_count, 0) AS comments,
        COALESCE(l.like_count, 0) AS likes
      FROM articles a
      LEFT JOIN (
        SELECT article_id, COUNT(*) AS comment_count 
        FROM comments 
        WHERE article_id IS NOT NULL
        GROUP BY article_id
      ) c ON c.article_id = a.id
      LEFT JOIN (
        SELECT article_id, COUNT(*) AS like_count 
        FROM likes 
        WHERE article_id IS NOT NULL
        GROUP BY article_id
      ) l ON l.article_id = a.id
      WHERE a.status = 'published'
      ORDER BY views DESC
      LIMIT 5
    `);

        const videos = await query(`
      SELECT id, title, views, thumbnail_url
      FROM videos
      WHERE status = 'visible'
      ORDER BY views DESC
      LIMIT 5
    `);

        const totals = await query(`
      SELECT 
        (SELECT COUNT(*) FROM likes) AS total_likes,
        (SELECT COUNT(*) FROM comments) AS total_comments
    `);

        const { getImageUrl } = require('../utils/imageHelper');

        const processedArticles = articles.rows.map(a => ({
            ...a,
            image_url: getImageUrl(req, a.image_url)
        }));

        const processedVideos = videos.rows.map(v => ({
            ...v,
            thumbnail_url: getImageUrl(req, v.thumbnail_url)
        }));

        res.json({
            success: true,
            data: {
                topArticles: processedArticles,
                topVideos: processedVideos,
                totals: totals.rows[0]
            }
        });
    } catch (err) {
        console.error("❌ Error engagement:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ------------------------
//  BUSINESS ANALYTICS
// ------------------------
router.get('/business', async (req, res) => {
    try {
        // Get total businesses count
        const total = await query(`SELECT COUNT(*) AS total FROM businesses WHERE status <> 'hidden'`);

        // Get reviews data
        const reviews = await query(`
            SELECT 
                COUNT(*) AS total_reviews,
                AVG(rating)::numeric(3,2) AS avg_rating
            FROM business_reviews
        `);

        // Get categories with percentage changes
        const categories = await query(`
            WITH current_counts AS (
                SELECT category, COUNT(*) AS count
                FROM businesses
                WHERE status <> 'hidden'
                GROUP BY category
            ),
            previous_counts AS (
                SELECT category, COUNT(*) AS previous_count
                FROM businesses
                WHERE status <> 'hidden'
                AND created_at < date_trunc('month', CURRENT_DATE)
                GROUP BY category
            )
            SELECT 
                c.category,
                c.count,
                COALESCE(pc.previous_count, 0) AS previous_count,
                CASE 
                    WHEN COALESCE(pc.previous_count, 0) = 0 THEN 
                        CASE WHEN c.count > 0 THEN 100 ELSE 0 END
                    ELSE 
                        ROUND(((c.count - pc.previous_count)::numeric / pc.previous_count) * 100, 0)
                END AS percentage_change
            FROM current_counts c
            LEFT JOIN previous_counts pc ON c.category = pc.category
            ORDER BY c.count DESC
            LIMIT 8
        `);

        res.json({
            success: true,
            data: {
                total_businesses: total.rows[0].total,
                categories: categories.rows,
                reviews: reviews.rows[0]
            }
        });
    } catch (err) {
        console.error("❌ Error business analytics:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ------------------------
//  RECENT ARTICLES
// ------------------------
router.get('/articles/recent', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '6'), 50);

    try {
        const sql = `
      SELECT a.id, a.title, a.slug, a.excerpt, a.image_url, a.views,
        a.category, a.author_name, a.created_at,
        COALESCE(c.comment_count, 0) AS comments
      FROM articles a
      LEFT JOIN (
        SELECT article_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY article_id
      ) c ON c.article_id = a.id
      WHERE a.status = 'published'
      ORDER BY a.publish_date DESC NULLS LAST, a.created_at DESC
      LIMIT $1
    `;
        const { getImageUrl } = require('../utils/imageHelper');

        const processedRows = rows.map(row => ({
            ...row,
            image_url: getImageUrl(req, row.image_url)
        }));

        res.json({ success: true, data: processedRows });
    } catch (err) {
        console.error("❌ Error recent articles:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ------------------------
//  TOP USER LOCATIONS
// ------------------------
router.get('/locations/top', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '5'), 20);

    try {
        const sql = `
      SELECT COALESCE(location, 'Unknown') AS location,
             COUNT(*) AS count
      FROM users
      GROUP BY COALESCE(location, 'Unknown')
      ORDER BY count DESC
      LIMIT $1
    `;

        const { rows } = await query(sql, [limit]);
        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("❌ Error locations:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ------------------------
module.exports = router;
