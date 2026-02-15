import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        // Find filename in DB
        const dbResult = await pool.query('SELECT filename FROM premade_reports WHERE id = $1', [id]);
        if (dbResult.rows.length === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const reportsPath = process.env.PREMADE_REPORTS_PATH;
        if (!reportsPath) throw new Error('PREMADE_REPORTS_PATH not configured');

        const filename = dbResult.rows[0].filename;
        const basename = path.basename(filename, path.extname(filename));
        const pngPath = path.join(reportsPath, `${basename}.png`);

        if (!fs.existsSync(pngPath)) {
            // Placeholder si no hay imagen
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const imageBuffer = fs.readFileSync(pngPath);

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600',
            },
        });

    } catch (error: any) {
        console.error('Error serving image:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
