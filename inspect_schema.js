const { Pool } = require('pg');

const connectionString = "postgresql://postgres:postgres@localhost:5432/db_app_compliance?schema=public";

const pool = new Pool({
    connectionString,
});

async function inspect() {
    try {
        const schemaQuery = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name IN ('cat_estado_auditoria', 'auditor')
        ORDER BY table_name, ordinal_position;
    `;
        const res = await pool.query(schemaQuery);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspect();
