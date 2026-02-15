import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Verificar si ya existe el like
        const checkQuery = 'SELECT id FROM premade_likes WHERE report_id = $1 AND user_id = $2';
        const checkResult = await pool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length > 0) {
            // Remover like (Toggle off)
            await pool.query('DELETE FROM premade_likes WHERE report_id = $1 AND user_id = $2', [id, userId]);
        } else {
            // Añadir like (Toggle on)
            await pool.query('INSERT INTO premade_likes (report_id, user_id) VALUES ($1, $2)', [id, userId]);
        }

        // Obtener nuevo conteo total
        const countResult = await pool.query('SELECT COUNT(*) as total FROM premade_likes WHERE report_id = $1', [id]);
        const totalLikes = parseInt(countResult.rows[0].total);

        // Opcional: Actualizar el cache en la tabla principal si se usa
        await pool.query('UPDATE premade_reports SET likes_count = $1 WHERE id = $2', [totalLikes, id]);

        return NextResponse.json({
            likes_count: totalLikes,
            isLiked: checkResult.rows.length === 0 // true si lo acabamos de añadir
        });

    } catch (error: any) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
