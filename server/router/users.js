const express = require('express');
const router = express.Router();
const pool = require('../connection/db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Optional: verify transporter
transporter.verify((err) => {
    if (err) console.error('❌ Mail error:', err);
    else console.log('✅ Mail service ready');
});

// List Users
router.get('/users-get', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, status, created_at as joined_at, 
            TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI') as last_login 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle User Status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expect 'Active' or 'Suspended'
        const result = await pool.query(
            'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mass Email API
router.post('/mass-email', async (req, res) => {
    const { subject, message, audience } = req.body;

    if (!subject || !message || !audience) {
        return res.status(400).json({ error: 'Subject, message and audience are required' });
    }

    try {

        let sql = `
      SELECT name, email
      FROM users
      WHERE 1=1
    `;
        const params = [];

        if (audience === 'members') {
            sql += ' AND role = $1';
            params.push('Member');
        } else if (audience === 'premium') {
            sql += ' AND role = $1';
            params.push('Premium');
        }

        const { rows: users } = await pool.query(sql, params);

        if (!users.length) {
            return res.status(404).json({ message: 'No users found for selected audience' });
        }

        /* -----------------------------
           2. Send emails
        ----------------------------- */
        let sent = 0;
        let failed = 0;

        console.log(`[Mass Email] Starting send for ${users.length} recipients...`);

        for (const user of users) {
            try {
                const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    /* Reset & Base Styles */
    body { 
      margin: 0; padding: 0; min-width: 100%; 
      background-color: #f8fafc; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
    }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
    
    /* Main Card */
    .main-card {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }

    /* Modern Header */
    .header {
      background: #020617; /* Deep Night */
      background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%);
      padding: 40px 20px;
      text-align: center;
      position: relative;
    }
    
    /* The "Tilet" Accent - Subtle Cultural Touch */
    .tilet-border {
      height: 4px;
      background: linear-gradient(90deg, #fbbf24 0%, #ef4444 33%, #22c55e 66%, #fbbf24 100%);
      width: 100%;
    }

    .logo-text {
      color: #ffffff;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    
    .logo-accent { color: #fbbf24; } /* Gold accent */

    /* Content Area */
    .content { padding: 48px 40px; }
    
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      display: block;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 20px 0;
      line-height: 1.2;
    }
    
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }

    /* High-End Button */
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background-color: #2563eb;
      color: #ffffff !important;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
      transition: transform 0.2s;
    }

    /* Footer */
    .footer {
      padding: 32px;
      background: #f1f5f9;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer-text {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
    }
    
    .social-links { margin-top: 16px; }
    .social-links a {
      color: #94a3b8;
      text-decoration: none;
      margin: 0 8px;
      font-size: 12px;
      font-weight: 600;
    }

    /* Mobile Responsiveness */
    @media screen and (max-width: 600px) {
      .main-card { margin: 0; border-radius: 0; }
      .content { padding: 32px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="tilet-border"></div>
      <div class="header">
        <a href="https://habeshaexpat.com" class="logo-text">
          Habesha<span class="logo-accent">Expat</span>
        </a>
      </div>
      
      <div class="content">
        <span class="greeting">Selam, ${user.name}!</span>
        <h1>${subject}</h1>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <div style="margin-top: 32px;">
          <a href="https://habeshaexpat.com/dashboard" class="cta-button">
            Go to Dashboard &rarr;
          </a>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">
          <strong>Habesha Expat Community</strong><br>
          Connecting the Diaspora Worldwide<br>
          Addis Ababa • Washington DC • Dubai • London
        </div>
        <div class="social-links">
          <a href="#">INSTAGRAM</a>
          <a href="#">TWITTER</a>
          <a href="#">COMMUNITY</a>
        </div>
        <div class="footer-text" style="margin-top: 24px; opacity: 0.6;">
          © ${new Date().getFullYear()} Habesha Expat. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

                await transporter.sendMail({
                    from: `"Habesha Expat" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject,
                    html
                });

                console.log(`[Mass Email] ✅ Sent to ${user.email}`);
                sent++;
            } catch (sendErr) {
                console.error(`[Mass Email] ❌ Failed to send to ${user.email}:`, sendErr.message);
                failed++;
            }
        }

        /* -----------------------------
           3. Response
        ----------------------------- */
        res.status(200).json({
            success: true,
            message: `Campaign complete. Sent: ${sent}, Failed: ${failed}`,
            recipientCount: sent
        });

    } catch (err) {
        console.error('Mass Email Error:', err);
        res.status(500).json({
            error: 'Failed to send emails',
            details: err.message
        });
    }
});


module.exports = router;