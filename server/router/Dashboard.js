const express = require('express');
const router = express.Router();
const pool = require('../connection/db');



router.get('/metrics', async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const jobCount = await pool.query("SELECT COUNT(*) FROM jobs WHERE status = 'visible'");
    const videoCount = await pool.query("SELECT COUNT(*) FROM videos");
    const eventCount = await pool.query("SELECT COUNT(*) FROM events WHERE status = 'visible' AND date >= CURRENT_DATE");
    const adsCount = await pool.query("SELECT COUNT(*) FROM ads WHERE status = 'active'");
    
    // Pending listings (Unified count)
    const pendingBusinesses = await pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'pending'");
    const pendingJobs = await pool.query("SELECT COUNT(*) FROM job_applicants WHERE status = 'Pending'");
    const pendingTotal = parseInt(pendingBusinesses.rows[0].count) + parseInt(pendingJobs.rows[0].count);

    res.json([
      { label: 'Total Users', value: parseInt(userCount.rows[0].count), badge: '+12%', progress: 70 },
      { label: 'Active Jobs', value: parseInt(jobCount.rows[0].count), badge: '+5%', progress: 65 },
      { label: 'Pending Items', value: pendingTotal, badge: 'Action Needed', progress: 40 },
      { label: 'Total Videos', value: parseInt(videoCount.rows[0].count), badge: '+8%', progress: 55 },
      { label: 'Upcoming Events', value: parseInt(eventCount.rows[0].count), badge: 'New', progress: 45 },
      { label: 'Active Ads', value: parseInt(adsCount.rows[0].count), badge: '98%', progress: 85 },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Growth Chart Data (Aggregated by month for current year)
router.get('/growth', async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(created_at, 'Mon') as name,
        COUNT(id) as users,
        (SELECT COUNT(*) FROM articles a WHERE TO_CHAR(a.created_at, 'Mon') = TO_CHAR(u.created_at, 'Mon')) as articles,
        (SELECT COUNT(*) FROM jobs j WHERE TO_CHAR(j.posted_date, 'Mon') = TO_CHAR(u.created_at, 'Mon')) as jobs
      FROM users u
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Top Regions (Based on User Location)
router.get('/regions', async (req, res) => {
    try {
        const query = `
            SELECT 
                COALESCE(location, 'Unknown') as name, 
                COUNT(*) as value
            FROM users 
            GROUP BY location 
            ORDER BY value DESC 
            LIMIT 5
        `;
        const result = await pool.query(query);
        
        // Add mocked codes/colors for UI compatibility
        const uiData = result.rows.map((row, idx) => ({
            ...row,
            code: row.name.substring(0, 2).toUpperCase(),
            growth: '+5%',
            color: idx === 0 ? 'bg-blue-500' : 'bg-slate-500',
            w: `w-[${Math.max(20, 100 - (idx * 20))}%]`
        }));

        res.json(uiData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Membership Distribution
router.get('/membership', async (req, res) => {
    try {
        const free = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'Member'");
        const premium = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'Premium'");
        
        res.json([
            { name: 'Free Members', value: parseInt(free.rows[0].count), color: '#3b82f6' },
            { name: 'Premium Members', value: parseInt(premium.rows[0].count), color: '#475569' }
        ]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;