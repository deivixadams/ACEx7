import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function verifyPassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const query = `
            SELECT 
                u.id_usuario as id, u.nombre, u.email, u.password_hash, u.avatar_url, u.activo,
                r.nombre as rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const user = result.rows[0];

        if (!user.activo) {
            return NextResponse.json({ error: 'Cuenta desactivada. Contacte al administrador.' }, { status: 403 });
        }

        const isValid = verifyPassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Return user info excluding sensitive hash
        const { password_hash, ...userProfile } = user;

        return NextResponse.json(userProfile);
    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
