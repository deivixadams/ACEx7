require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const sql = fs.readFileSync('_gestion_setup.sql', 'utf8');
    try {
        console.log('Running migration script...');
        await pool.query(sql);
        console.log('Migration successful!');
        await pool.end();
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
