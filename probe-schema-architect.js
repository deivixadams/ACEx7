
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@trace-postgres:5432/db_app_compliance?schema=public",
});

async function probe() {
    try {
        const tables = ['auditor', 'roles', 'usuarios', 'auditoria', 'empresa', 'auditoria_auditor'];
        const query = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = ANY($1)
      ORDER BY table_name, ordinal_position;
    `;
        const result = await pool.query(query, [tables]);
        console.log(JSON.stringify(result.rows, null, 2));
        await pool.end();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

probe();
