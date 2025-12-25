const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');

router.get('/audit-logs-get', async (req, res) => {
  try {
    const sql = `
      SELECT
        al.id,
        al.admin_id,
        a.name AS admin_name,
        a.email AS admin_email,
        a.role AS admin_role,
        al.action,
        al.target_type,
        al.target_id,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at
      FROM audit_logs al
      LEFT JOIN administrators a
        ON al.admin_id = a.id
      ORDER BY al.created_at DESC
    `;

    const result = await query(sql);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

module.exports = router;
