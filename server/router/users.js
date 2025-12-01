const express = require('express');
const router = express.Router();
const pool = require('../connection/db');

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

    try {
        // 1. Determine Target Audience Query
        let query = "SELECT email, name FROM users WHERE status = 'Active'";
        let params = [];

        if (audience === 'members') {
            query += " AND role = $1";
            params.push('Member');
        } else if (audience === 'premium') {
            query += " AND role = $1";
            params.push('Premium');
        }

        const result = await pool.query(query, params);
        const recipients = result.rows;

        if (recipients.length === 0) {
            return res.status(404).json({ message: 'No active users found for the selected audience.' });
        }

        // 2. Generate Beautiful HTML Email Template
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 60px; }
                .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; }
                .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; border-bottom: 4px solid #3b82f6; }
                .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
                .header-subtitle { color: #94a3b8; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
                .body-content { padding: 40px 30px; color: #334155; line-height: 1.7; font-size: 16px; }
                .body-content h2 { color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
                .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 25px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: background-color 0.3s; }
                .footer { background-color: #f1f5f9; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
                .footer a { color: #3b82f6; text-decoration: none; font-weight: 500; }
                .divider { height: 1px; background-color: #e2e8f0; margin: 25px 0; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="main">
                    <div class="header">
                        <h1>Habesha Expat</h1>
                        <div class="header-subtitle">Official Community Update</div>
                    </div>
                    <div class="body-content">
                        <h2>${subject}</h2>
                        <p>${message.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>')}</p>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #64748b; font-style: italic;">
                            You are receiving this important update as a valued member of our community.
                        </p>
                        
                        <center>
                            <a href="https://habeshaexpat.com/dashboard" class="cta-button">Visit Your Dashboard</a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Habesha Expat. All rights reserved.</p>
                        <p>Addis Ababa, Ethiopia • Washington DC, USA</p>
                        <p>
                            <a href="#">Manage Preferences</a> | <a href="#">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // 3. Send Emails (Simulated)
        // In production, integrate with Nodemailer, SendGrid, or AWS SES here.
        // Example: await transporter.sendMail({ from: '...', to: recipients.map(r => r.email), html: htmlContent });

        console.log(`[Mass Email Service] Processing batch for ${recipients.length} recipients.`);
        console.log(`[Target] ${audience.toUpperCase()}`);
        console.log(`[Subject] ${subject}`);
        // console.log(`[Content Preview]`, htmlContent); // Uncomment to debug HTML

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));

        res.json({ 
            success: true,
            message: `Campaign successfully queued for ${recipients.length} recipients.`,
            recipientCount: recipients.length
        });

    } catch (err) {
        console.error('Mass Email Error:', err);
        res.status(500).json({ error: 'Failed to queue emails: ' + err.message });
    }
});

module.exports = router;