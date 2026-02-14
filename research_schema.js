const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/db_app_compliance?schema=public'
});

async function run() {
    try {
        const table = process.argv[2];
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [table]);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
