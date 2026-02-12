require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const sql = fs.readFileSync('_extend_users.sql', 'utf8');
    try {
        console.log('Running extension migration script...');
        await pool.query(sql);
        console.log('Extension migration successful!');
        await pool.end();
    } catch (err) {
        console.error('Extension migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
