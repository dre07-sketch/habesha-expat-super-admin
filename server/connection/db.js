// db.js
require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL Pool
const pgPool = new Pool({
    host: 'localhost',          // your PostgreSQL host
    user: 'postgres',           // your PostgreSQL username
    password: '1234',       // your PostgreSQL password
    database: 'habesha-expat',  // your database name
    port: 5432,                 // default PostgreSQL port
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
