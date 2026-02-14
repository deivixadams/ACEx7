const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/db_app_compliance?schema=public'
});

const sql = `
CREATE TABLE IF NOT EXISTS evaluacion_resultados (
  id BIGSERIAL PRIMARY KEY,
  auditoria_id BIGINT REFERENCES auditoria(id),
  entidad_tipo TEXT NOT NULL, -- 'control' or 'requerimiento'
  entidad_id TEXT NOT NULL,
  estado TEXT, -- 'cumple', 'no_cumple', 'parcial', 'no_aplica'
  observaciones TEXT,
  hallazgo_id BIGINT REFERENCES hallazgo(id), 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

async function run() {
    try {
        await pool.query(sql);
        console.log('Table evaluacion_resultados created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await pool.end();
    }
}

run();
