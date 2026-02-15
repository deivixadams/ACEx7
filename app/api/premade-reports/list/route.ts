import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        const query = `
            SELECT r.id, r.filename, r.title, r.description, r.category, r.download_count, r.likes_count,
                   (SELECT COUNT(*) FROM premade_likes WHERE report_id = r.id AND user_id = $1) > 0 as "isLiked",
                   r.created_at 
            FROM premade_reports r
            ORDER BY r.created_at DESC;
        `;
        const result = await pool.query(query, [userId || 'guest']);

        return NextResponse.json({
            reports: result.rows
        });

    } catch (error: any) {
        console.error('Error listing reports:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
