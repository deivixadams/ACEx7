const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const sql = fs.readFileSync(path.join(__dirname, 'add_avatar_column.sql'), 'utf8');
    try {
        await pool.query(sql);
        console.log('Migration completed: avatar_url added to usuarios.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
