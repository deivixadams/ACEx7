import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const result = await pool.query(`
            SELECT id, author, content, created_at 
            FROM premade_comments 
            WHERE report_id = $1 
            ORDER BY created_at DESC;
        `, [id]);

        return NextResponse.json({
            comments: result.rows
        });

    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { content, author } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const result = await pool.query(`
            INSERT INTO premade_comments (report_id, content, author)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [id, content, author || 'Usuario ACEx7']);

        return NextResponse.json({
            comment: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
