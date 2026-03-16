// db.js
require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL Pool
const pgPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 10,                    // max connections in the pool
    idleTimeoutMillis: 30000,   // close idle clients after 30 seconds
});

// Universal query function
const query = async (sql, params = []) => {
    try {
        const result = await pgPool.query(sql, params);

        // If INSERT with RETURNING id, return insertId
        const insertId = result.rows.length > 0 && result.rows[0].id ? result.rows[0].id : null;

        return { rows: result.rows, insertId };
    } catch (err) {
        console.error("Database Error:", err);
        throw err;
    }
};


// Export the query function
module.exports = { query };
