import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const query = `
            SELECT id, filename, title, description, category, download_count, created_at 
            FROM premade_reports 
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query);

        return NextResponse.json({
            reports: result.rows
        });

    } catch (error: any) {
        console.error('Error listing reports:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
