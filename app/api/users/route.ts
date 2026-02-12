import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// World-class hashing logic using PBKDF2
function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export async function GET() {
    try {
        const query = `
            SELECT 
                u.id_usuario as id, 
                u.nombre, 
                u.email, 
                u.puesto,
                u.telefono,
                u.direccion,
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
        const { id, nombre, email, id_rol, id_empresa, activo, puesto, telefono, direccion, password } = body;

        let password_hash = null;
        if (password) {
            password_hash = hashPassword(password);
        }

        if (id) {
            // Update
            let query = `
                UPDATE usuarios 
                SET nombre = $1, email = $2, id_rol = $3, id_empresa = $4, activo = $5, 
                    puesto = $6, telefono = $7, direccion = $8
            `;
            const params: any[] = [nombre, email, id_rol, id_empresa, activo, puesto, telefono, direccion];

            if (password_hash) {
                query += `, password_hash = $9 WHERE id_usuario = $10`;
                params.push(password_hash, id);
            } else {
                query += ` WHERE id_usuario = $9`;
                params.push(id);
            }

            const result = await pool.query(query, params);
            return NextResponse.json(result.rows[0]);
        } else {
            // Create
            const query = `
                INSERT INTO usuarios (nombre, email, id_rol, id_empresa, activo, puesto, telefono, direccion, password_hash)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const result = await pool.query(query, [
                nombre,
                email,
                id_rol,
                id_empresa,
                activo !== undefined ? activo : true,
                puesto,
                telefono,
                direccion,
                password_hash || hashPassword(Math.random().toString(36)) // Default random pass if not provided
            ]);
            return NextResponse.json(result.rows[0]);
        }
    } catch (error: any) {
        console.error('Users API POST Error:', error);
        return NextResponse.json({ error: 'Failed to save user', details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Users API DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
