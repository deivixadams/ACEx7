import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { auditoria_id, results, compliance, fecha } = body;

        if (!auditoria_id) {
            return NextResponse.json({ error: 'auditoria_id required' }, { status: 400 });
        }

        // Results is a Record<entity_id, observation_text>
        // Compliance is a Record<entity_id, status>

        const entities = Object.keys({ ...results, ...compliance });

        for (const id of entities) {
            const observation = results[id] || null;
            const status = compliance[id] || null;

            // Upsert logic (simplified for SQLite/Postgres)
            // On Postgres we can use ON CONFLICT
            await pool.query(
                `INSERT INTO evaluacion_resultados (auditoria_id, entidad_tipo, entidad_id, estado, observaciones, fecha)
         VALUES ($1, 'requirement', $2, $3, $4, $5)
         ON CONFLICT (auditoria_id, entidad_id) DO UPDATE SET 
           estado = EXCLUDED.estado,
           observaciones = EXCLUDED.observaciones,
           fecha = EXCLUDED.fecha,
           updated_at = CURRENT_TIMESTAMP`,
                [auditoria_id, id, status, observation, fecha || new Date()]
            );
        }

        // Actually, ON CONFLICT (id) won't work easily if we don't have the ID. 
        // Usually we upsert by (auditoria_id, entidad_id).
        // Let's check if we have a unique constraint. If not, we should add it.

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Save evaluation error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
