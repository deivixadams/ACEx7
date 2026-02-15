import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        // Incrementar el contador de likes de forma atómica
        const result = await pool.query(`
            UPDATE premade_reports 
            SET likes_count = likes_count + 1 
            WHERE id = $1 
            RETURNING likes_count;
        `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({
            likes_count: result.rows[0].likes_count
        });

    } catch (error: any) {
        console.error('Error liking report:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
