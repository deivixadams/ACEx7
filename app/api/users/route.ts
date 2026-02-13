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
                u.avatar_url,
                r.id_rol,
                r.nombre as rol_nombre,
                u.id_empresa,
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
        console.log('Incoming POST Users Body:', body);
        const { id, nombre, email, id_rol, id_empresa, activo, puesto, telefono, direccion, password, avatar_url } = body;

        let password_hash = null;
        if (password) {
            password_hash = hashPassword(password);
        }

        const cleanIdEmpresa = (id_empresa === '0' || id_empresa === 0 || id_empresa === 'undefined' || !id_empresa) ? null : id_empresa;
        const cleanIdRol = (id_rol === 'undefined' || !id_rol) ? null : id_rol;

        if (id) {
            // Update
            let query = `
                UPDATE usuarios 
                SET nombre = $1, email = $2, id_rol = $3, id_empresa = $4, activo = $5, 
                    puesto = $6, telefono = $7, direccion = $8, avatar_url = $9
            `;
            const params: any[] = [
                nombre,
                email,
                cleanIdRol,
                cleanIdEmpresa,
                activo,
                puesto,
                telefono,
                direccion,
                avatar_url
            ];

            if (password_hash) {
                query += `, password_hash = $10 WHERE id_usuario = $11 RETURNING *, id_usuario as id`;
                params.push(password_hash, id);
            } else {
                query += ` WHERE id_usuario = $10 RETURNING *, id_usuario as id`;
                params.push(id);
            }

            console.log('Executing User UPDATE (Cleaned):', { query, params });
            const result = await pool.query(query, params);

            console.log('UPDATE Result:', {
                rowCount: result.rowCount,
                returned: result.rows[0] ? 'yes' : 'no'
            });

            if (result.rowCount === 0) {
                return NextResponse.json({
                    error: `No se encontró el usuario con ID: ${id}. No se realizaron cambios.`,
                    details: 'La cláusula WHERE no coincidió con ningún registro.'
                }, { status: 404 });
            }

            return NextResponse.json(result.rows[0]);
        } else {
            // Create
            const query = `
                INSERT INTO usuarios (nombre, email, id_rol, id_empresa, activo, puesto, telefono, direccion, avatar_url, password_hash)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *, id_usuario as id
            `;
            const result = await pool.query(query, [
                nombre,
                email,
                cleanIdRol,
                cleanIdEmpresa,
                activo !== undefined ? activo : true,
                puesto,
                telefono,
                direccion,
                avatar_url,
                password_hash || hashPassword(Math.random().toString(36))
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
