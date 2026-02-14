
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { getReporteById } from '@/lib/reportes';

/**
 * API Route to generate and export DOCX report.
 * Template: C:\AML-AUDIT\PLANTILLA_INFORME_AML_DOCXTEMPLATER.docx
 * Now handles POST to receive reportMetadata.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const body = await request.json();
        const { reportMetadata } = body;

        // 1. Fetch report data with merged metadata
        const data = await getReporteById(id, reportMetadata);

        // 2. Load the template from the fixed location
        const templatePath = 'C:\\AML-AUDIT\\PLANTILLA_INFORME_AML_DOCXTEMPLATER.docx';

        if (!fs.existsSync(templatePath)) {
            console.error(`Template not found at: ${templatePath}`);
            return NextResponse.json(
                { error: 'La plantilla del informe no fue encontrada en el servidor (C:\\AML-AUDIT\\).' },
                { status: 500 }
            );
        }

        const content = fs.readFileSync(templatePath, 'binary');

        // 3. Initialize PizZip and Docxtemplater
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // 4. Render the document with data
        doc.render(data);

        // 5. Generate the output buffer
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // 6. Return the response as a binary download
        return new Response(new Uint8Array(buf), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="informe-${id}.docx"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating DOCX:', error);

        const errorMessage = error.properties?.errors
            ? JSON.stringify(error.properties.errors)
            : error.message;

        return NextResponse.json(
            { error: 'Error al generar el documento DOCX.', details: errorMessage },
            { status: 500 }
        );
    }
}

// Optional: Keep GET for simple testing if needed, or redirect to an error
export async function GET() {
    return NextResponse.json({ error: 'Este endpoint requiere una petición POST con los metadatos del informe.' }, { status: 405 });
}
