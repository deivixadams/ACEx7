import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await pool.query('SELECT id, nombre, nit, activo FROM empresa ORDER BY id ASC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Companies API GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, nit, activo, id } = body;

        if (id) {
            // Update
            const query = `
                UPDATE empresa 
                SET nombre = $1, nit = $2, activo = $3
                WHERE id = $4
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, nit, activo, id]);
            return NextResponse.json(result.rows[0]);
        } else {
            // Create
            const query = `
                INSERT INTO empresa (nombre, nit, activo)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, nit, activo !== undefined ? activo : true]);
            return NextResponse.json(result.rows[0]);
        }
    } catch (error: any) {
        console.error('Companies API POST Error:', error);
        return NextResponse.json({ error: 'Failed to save company' }, { status: 500 });
    }
}
