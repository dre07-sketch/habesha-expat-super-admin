const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { query, DB_TYPE } = require('../connection/db'); // Your specific import
require('dotenv').config();


const OTP_SECRET = process.env.OTP_SECRET || 'your-secret-key-change-this';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;


const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP host
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});


const getCoolEmailTemplate = (otp, name) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Inter', sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          
          <!-- Glass Card -->
          <table width="450" border="0" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 24px; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden;">
            
            <!-- Top Gradient Bar -->
            <tr>
              <td style="height: 6px; background: linear-gradient(90deg, #4f46e5, #ec4899);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                
                <!-- Icon -->
                <div style="margin-bottom: 24px;">
                   <img src="https://cdn-icons-png.flaticon.com/512/9623/9623637.png" width="48" style="opacity: 0.9;" alt="Lock">
                </div>

                <!-- Headline -->
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Reset Password</h1>
                <p style="color: #94a3b8; font-size: 15px; line-height: 24px; margin: 0 0 32px 0;">
                  Hi ${name},<br>
                  We received a request to access your administrator account. Use the code below to verify your identity.
                </p>

                <!-- OTP Container -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 16px; border: 1px solid #334155;">
                  <tr>
                    <td align="center" style="padding: 24px;">
                      <span style="font-family: monospace; color: #818cf8; font-size: 36px; font-weight: 700; letter-spacing: 8px; display: block;">
                        ${otp}
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- Warning -->
                <p style="color: #64748b; font-size: 13px; margin-top: 32px; text-align: center;">
                  This code expires in <strong style="color: #e2e8f0;">3 minutes</strong>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #020617; padding: 24px; text-align: center; border-top: 1px solid #334155;">
                <p style="color: #475569; font-size: 12px; margin: 0;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};


router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    
    const sql = "SELECT id, name, email FROM administrators WHERE email = $1";
    const result = await query(sql, [email]);
    
   
    const rows = Array.isArray(result) ? result : result.rows;

    if (!rows || rows.length === 0) {
      
      return res.status(404).json({ message: "Email not registered" });
    }

    const admin = rows[0];

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    const ttl = 3 * 60 * 1000; 
    const expires = Date.now() + ttl;

    
    const data = `${email}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;

    
    const mailOptions = {
      from: `"Habesha Expat Security" <${EMAIL_USER}>`,
      to: email,
      subject: '🔑 Your Verification Code',
      html: getCoolEmailTemplate(otp, admin.name || 'Admin'),
    };

    await transporter.sendMail(mailOptions);

    
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      hash: fullHash, 
      email: email 
    });

  } catch (error) {
    console.error("OTP Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post('/verify-otp', (req, res) => {
  const { email, otp, hash } = req.body;

  if (!hash) return res.status(400).json({ message: "Hash is missing" });

  const [hashValue, expires] = hash.split('.');

  // 1. Check Expiration
  let now = Date.now();
  if (now > parseInt(expires)) {
    return res.status(400).json({ message: "Code has expired. Please try again." });
  }

  // 2. Re-calculate Hash
  const data = `${email}.${otp}.${expires}`;
  const newCalculatedHash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

  // 3. Compare
  if (newCalculatedHash === hashValue) {
    return res.status(200).json({ message: "Success", verified: true });
  } else {
    return res.status(400).json({ message: "Invalid Code" });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    // 1. Hash the new password
    // salt rounds = 10 (standard security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Update the 'administrators' table
    // We update the 'password_hash' column based on the 'email'
    const sql = "UPDATE administrators SET password_hash = $1 WHERE email = $2 RETURNING id";
    
    // Execute query
    const result = await query(sql, [hashedPassword, email]);
    
    // Check if the update actually happened
    // (Handle difference between pg response types just in case)
    const rowCount = result.rowCount || (result.rows ? result.rows.length : 0);

    if (rowCount === 0) {
      return res.status(404).json({ message: "User not found or update failed" });
    }

    // 3. Success
    return res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;