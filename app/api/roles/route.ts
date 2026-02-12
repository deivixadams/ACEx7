import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await pool.query('SELECT id_rol as id, nombre, descripcion, activo FROM roles ORDER BY id_rol ASC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Roles API GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const { nombre, descripcion, activo } = await request.json();
        const result = await pool.query(
            'INSERT INTO roles (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING id_rol as id',
            [nombre, descripcion, activo ?? true]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Roles API POST Error:', error);
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}
