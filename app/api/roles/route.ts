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
