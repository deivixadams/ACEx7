import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { llmStudioChat } from '@/lib/llm/llmstudio';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { entity_name, period_start, period_end, requirements } = body;

        // 1. Leer el Prompt del Auditor Senior
        const promptPath = 'C:\\AML-AUDIT\\PLANTILLA_PROMPT_preMADE_INFORME_PLAFT_DOCXTEMPLATER.MD';
        if (!fs.existsSync(promptPath)) {
            throw new Error(`No se encontró el prompt en: ${promptPath}`);
        }
        const promptTemplate = fs.readFileSync(promptPath, 'utf8');

        // 2. Construir la entrada para la IA
        const aiInput = `
ENTRADA (EL SISTEMA PEGARÁ AQUÍ)
- entity_name: ${entity_name}
- period_start: ${period_start}
- period_end: ${period_end}
- applicable_laws: ["Ley 155-17 contra el Lavado de Activos y el Financiamiento del Terrorismo", "Reglamento 408-17"]
- requirements: ${JSON.stringify(requirements, null, 2)}
`;

        const fullPrompt = promptTemplate + aiInput;

        // 3. Llamar a la IA para generar el JSON estructurado
        const model = process.env.LLM_MODEL || 'mistral-7b';
        const useSystemRole = process.env.LLM_SYSTEM_ROLE !== 'false';

        const messages = useSystemRole
            ? [
                { role: 'system' as const, content: 'Eres un experto auditor PLAFT que responde estrictamente en JSON.' },
                { role: 'user' as const, content: fullPrompt }
            ]
            : [
                { role: 'user' as const, content: `Eres un experto auditor PLAFT que responde estrictamente en JSON.\n\n${fullPrompt}` }
            ];

        console.log(`[PREMADE] Calling LLM model="${model}" systemRole=${useSystemRole}`);
        const response = await llmStudioChat({ model, messages });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI Server Error:', response.status, errorText);
            throw new Error(`Error del servidor de IA: ${response.status} - ${errorText}`);
        }

        const jsonRes = await response.json();
        const aiContent = jsonRes.choices?.[0]?.message?.content || "";
        console.log('AI Content Raw:', aiContent);

        // Limpiar y extraer JSON de forma robusta
        let cleanContent = aiContent.trim();
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
        }

        console.log('AI Content Extracted:', cleanContent);

        if (!cleanContent) {
            throw new Error('La IA devolvió un contenido vacío o sin formato JSON.');
        }

        let auditData;
        try {
            auditData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Failed to parse AI JSON. Content was:', cleanContent);
            throw new Error('La respuesta de la IA no es un JSON válido.');
        }

        // 4. Leer la plantilla DOCX
        const templatePath = 'C:\\AML-AUDIT\\PLANTILLA_preMADE_INFORME_PLAFT_DOCXTEMPLATER.docx';
        if (!fs.existsSync(templatePath)) {
            throw new Error(`No se encontró la plantilla DOCX en: ${templatePath}`);
        }
        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // 5. Renderizar el documento con los datos de la IA
        doc.render(auditData);

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // 6. Retornar el archivo
        return new NextResponse(new Uint8Array(buf), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename=Informe_PLAFT_${entity_name.replace(/\s+/g, '_')}.docx`,
            },
        });

    } catch (error: any) {
        console.error('Error in PreMade Report API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
