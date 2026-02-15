import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        // Obtener el nombre del archivo de la base de datos
        const result = await pool.query('SELECT filename FROM premade_reports WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const filename = result.rows[0].filename;
        const reportsPath = process.env.PREMADE_REPORTS_PATH || 'D:\\__AMLAudit_x7\\INFORMES_PREMADE';
        const docxPath = path.join(reportsPath, filename);

        if (!fs.existsSync(docxPath)) {
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

        // Convertir DOCX a HTML usando mammoth
        const docxBuffer = fs.readFileSync(docxPath);
        const conversionResult = await mammoth.convertToHtml({ buffer: docxBuffer });

        return NextResponse.json({
            html: conversionResult.value,
            warnings: conversionResult.warnings
        });

    } catch (error: any) {
        console.error('Error generating preview:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
