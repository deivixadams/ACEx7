import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET comments for a report
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const result = await pool.query(`
            SELECT id, author, content, user_id, created_at 
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

// POST a new comment
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { content, author, userId } = await req.json();

        if (!content || !userId) {
            return NextResponse.json({ error: 'Content and UserId are required' }, { status: 400 });
        }

        const result = await pool.query(`
            INSERT INTO premade_comments (report_id, content, author, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [id, content, author || 'Usuario ACEx7', userId]);

        return NextResponse.json({
            comment: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a comment
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // En este caso el 'id' del params es el report_id, pero necesitamos el comment_id.
        // Podríamos cambiar la estructura de la ruta o usar query params.
        // Como la ruta es /api/premade-reports/comments/[id], el id es del repo.
        // Usaré query param ?commentId=... para borrar
        const { searchParams } = new URL(req.url);
        const commentId = searchParams.get('commentId');
        const userId = searchParams.get('userId');

        if (!commentId || !userId) {
            return NextResponse.json({ error: 'CommentId and UserId are required' }, { status: 400 });
        }

        // Verificar que el comentario pertenezca al usuario
        const deleteResult = await pool.query(
            'DELETE FROM premade_comments WHERE id = $1 AND user_id = $2 RETURNING *',
            [commentId, userId]
        );

        if (deleteResult.rows.length === 0) {
            return NextResponse.json({ error: 'Comment not found or unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ message: 'Comment deleted' });
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// EDIT a comment
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { content, commentId, userId } = await req.json();

        if (!content || !commentId || !userId) {
            return NextResponse.json({ error: 'Content, CommentId and UserId are required' }, { status: 400 });
        }

        const updateResult = await pool.query(
            'UPDATE premade_comments SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [content, commentId, userId]
        );

        if (updateResult.rows.length === 0) {
            return NextResponse.json({ error: 'Comment not found or unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ comment: updateResult.rows[0] });
    } catch (error: any) {
        console.error('Error editing comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
