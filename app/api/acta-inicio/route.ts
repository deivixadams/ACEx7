
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * API for Acta de Inicio (Audit Start Act)
 * Handles CRUD and professional logic (auto-numbering, risk-normative-mapping)
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const auditoriaId = searchParams.get('auditoriaId');
        const id = searchParams.get('id');

        if (id) {
            const res = await pool.query('SELECT * FROM acta_auditoria WHERE id_acta = $1', [id]);
            return NextResponse.json(res.rows[0]);
        }

        if (auditoriaId) {
            // Get Acta and its linked auditores and alcances
            const actaRes = await pool.query('SELECT * FROM acta_auditoria WHERE id_auditoria = $1', [auditoriaId]);
            if (actaRes.rowCount === 0) return NextResponse.json({ found: false });

            const actaId = actaRes.rows[0].id_acta;

            const auditoresRes = await pool.query('SELECT id_usuario FROM acta_auditores_link WHERE id_acta = $1', [actaId]);
            const alcancesRes = await pool.query('SELECT id_alcance FROM acta_alcances_link WHERE id_acta = $1', [actaId]);

            return NextResponse.json({
                ...actaRes.rows[0],
                found: true,
                auditores: auditoresRes.rows.map(r => r.id_usuario),
                alcances: alcancesRes.rows.map(r => r.id_alcance)
            });
        }

        const all = await pool.query('SELECT * FROM acta_auditoria ORDER BY created_at DESC');
        return NextResponse.json(all.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            id_auditoria,
            id_empresa,
            unidades_incluidas,
            periodo_inicio,
            periodo_fin,
            fecha_inicio_auditoria,
            tipo_auditoria,
            objetivo,
            alcance_excluye,
            enfoque,
            tecnicas,
            lider_auditor_id,
            auditores, // Array of IDs
            alcances,   // Array of IDs
            cronograma,
            punto_contacto,
            eval_risks // Flag to suggest normative base
        } = body;

        // 1. Auto-numbering logic
        const year = new Date().getFullYear();
        const countRes = await pool.query('SELECT count(*) FROM acta_auditoria WHERE EXTRACT(YEAR FROM created_at) = $1', [year]);
        const seq = (parseInt(countRes.rows[0].count) + 1).toString().padStart(4, '0');
        const numero_acta = `ACTA-${year}-${seq}`;

        // 2. Suggest Normative Base based on Risks if requested
        let suggestedNormative = "";
        if (eval_risks && id_auditoria) {
            const normRes = await pool.query(`
                SELECT DISTINCT r.base_normativa 
                FROM requirements r
                JOIN risk_by_req rr ON r.id_requerimiento = rr.id_requerimiento
                WHERE rr.id_riesgo IN (
                    /* This is illustrative, ideally filter by risks selected for this audit */
                    SELECT id_riesgo FROM risk_by_req /* Filter... */
                )
             `);
            suggestedNormative = normRes.rows.map(r => r.base_normativa).filter(Boolean).join('; ');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertActa = await client.query(`
                INSERT INTO acta_auditoria (
                    id_auditoria, numero_acta, id_empresa, unidades_incluidas, 
                    periodo_inicio, periodo_fin, fecha_inicio_auditoria, 
                    tipo_auditoria, objetivo, alcance_excluye, enfoque, 
                    tecnicas, lider_auditor_id, cronograma, 
                    punto_contacto_nombre, punto_contacto_cargo, 
                    estado, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'BORRADOR', NOW())
                RETURNING *
            `, [
                id_auditoria, numero_acta, id_empresa, unidades_incluidas,
                periodo_inicio, periodo_fin, fecha_inicio_auditoria,
                tipo_auditoria, objetivo, alcance_excluye, enfoque,
                JSON.stringify(tecnicas || []), lider_auditor_id, JSON.stringify(cronograma || {}),
                punto_contacto?.nombre, punto_contacto?.cargo
            ]);

            const newActaId = insertActa.rows[0].id_acta;

            // Link Auditores
            if (auditores && Array.isArray(auditores)) {
                for (const uid of auditores) {
                    await client.query('INSERT INTO acta_auditores_link (id_acta, id_usuario) VALUES ($1, $2)', [newActaId, uid]);
                }
            }

            // Link Alcances
            if (alcances && Array.isArray(alcances)) {
                for (const aid of alcances) {
                    await client.query('INSERT INTO acta_alcances_link (id_acta, id_alcance) VALUES ($1, $2)', [newActaId, aid]);
                }
            }

            await client.query('COMMIT');
            return NextResponse.json(insertActa.rows[0]);
        } catch (e: any) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (err: any) {
        console.error('Acta POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
