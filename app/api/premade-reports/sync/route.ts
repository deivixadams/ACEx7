import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const reportsPath = process.env.PREMADE_REPORTS_PATH;
        if (!reportsPath) {
            throw new Error('PREMADE_REPORTS_PATH not configured in .env');
        }

        if (!fs.existsSync(reportsPath)) {
            return NextResponse.json({ error: `Path does not exist: ${reportsPath}` }, { status: 404 });
        }

        const files = fs.readdirSync(reportsPath);
        const docxFiles = files.filter(f => f.toLowerCase().endsWith('.docx'));

        const syncedReports = [];

        for (const file of docxFiles) {
            const basename = path.basename(file, path.extname(file));
            const pngFile = `${basename}.png`;
            const hasPng = files.includes(pngFile) || files.includes(pngFile.toLowerCase());

            // Si no tiene PNG, tal vez no queremos mostrarlo en la galería premium, 
            // pero el usuario dijo que cada uno tiene una foto.

            // Upsert into DB
            const query = `
                INSERT INTO premade_reports (filename, title, category, description)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (filename) DO UPDATE 
                SET title = EXCLUDED.title,
                    category = EXCLUDED.category
                RETURNING *;
            `;

            // Título amigable: reemplazar _ y - por espacios y capitalizar
            const cleanTitle = basename.replace(/[-_]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());

            // Categoría sugerida a partir del nombre si contiene ciertas palabras
            let category = "Informe General";
            const lowerFile = basename.toLowerCase();
            if (lowerFile.includes('plaft')) category = "PLAFT / AML";
            if (lowerFile.includes('riesgo')) category = "Gestión de Riesgos";
            if (lowerFile.includes('control')) category = "Controles Internos";
            if (lowerFile.includes('check') || lowerFile.includes('lista')) category = "Check list";

            const values = [file, cleanTitle, category, `Informe de auditoría especializado: ${cleanTitle}`];

            const result = await pool.query(query, values);
            syncedReports.push(result.rows[0]);
        }

        return NextResponse.json({
            message: `Synced ${syncedReports.length} reports successfully`,
            reports: syncedReports
        });

    } catch (error: any) {
        console.error('Error syncing reports:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
