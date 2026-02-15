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

        // Find filename and increment count
        const dbResult = await pool.query(`
            UPDATE premade_reports 
            SET download_count = download_count + 1 
            WHERE id = $1 
            RETURNING filename, title;
        `, [id]);

        if (dbResult.rows.length === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const reportsPath = process.env.PREMADE_REPORTS_PATH;
        if (!reportsPath) throw new Error('PREMADE_REPORTS_PATH not configured');

        const { filename, title } = dbResult.rows[0];
        const filePath = path.join(reportsPath, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        // Sanitize title for filename
        const safeTitle = title.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        const downloadName = `Informe_${safeTitle}.docx`;

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${downloadName}"`,
            },
        });

    } catch (error: any) {
        console.error('Error downloading report:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
