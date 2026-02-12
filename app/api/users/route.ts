import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const query = `
            SELECT 
                u.id_usuario as id, 
                u.nombre, 
                u.email, 
                u.activo,
                r.id_rol,
                r.nombre as rol_nombre,
                e.id as empresa_id,
                e.nombre as empresa_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN empresa e ON u.id_empresa = e.id
            ORDER BY u.created_at DESC
        `;
        const result = await pool.query(query);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Users API GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, nombre, email, id_rol, id_empresa, activo } = body;

        if (id) {
            // Update
            const query = `
                UPDATE usuarios 
                SET nombre = $1, email = $2, id_rol = $3, id_empresa = $4, activo = $5
                WHERE id_usuario = $6
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, email, id_rol, id_empresa, activo, id]);
            return NextResponse.json(result.rows[0]);
        } else {
            // Create
            const query = `
                INSERT INTO usuarios (nombre, email, id_rol, id_empresa, activo)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, email, id_rol, id_empresa, activo !== undefined ? activo : true]);
            return NextResponse.json(result.rows[0]);
        }
    } catch (error: any) {
        console.error('Users API POST Error:', error);
        return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
    }
}
