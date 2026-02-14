import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const res = await pool.query('SELECT * FROM auditoria WHERE id = $1', [id]);
            if (res.rowCount === 0) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
            return NextResponse.json(res.rows[0]);
        }

        const res = await pool.query('SELECT * FROM auditoria ORDER BY created_at DESC LIMIT 10');
        return NextResponse.json(res.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { codigo, empresa_id, auditor_lider_id, objetivo, alcance } = body;

        const res = await pool.query(
            `INSERT INTO auditoria (codigo, empresa_id, auditor_lider_id, objetivo, alcance, fecha_inicio, estado_id)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 1)
       RETURNING *`,
            [codigo || `AUD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`, empresa_id || 1, auditor_lider_id || 1, objetivo, alcance]
        );

        return NextResponse.json(res.rows[0]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
