
import { NextRequest, NextResponse } from 'next/server';
import { llmStudioChat } from '@/lib/llm/llmstudio';

/**
 * API Route to refine text or generate content using AI for audit reports.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, field, type, context } = body;

        // No artificial delay — real AI generation

        // Handle "Generate All" based on context
        if (type === 'generate_all' && context) {
            const { risks, controls } = context;

            return NextResponse.json({
                metadata: {
                    objetivos: `Evaluar integralmente los controles internos asociados a ${risks.length} riesgos críticos identificado(s), incluyendo: ${risks.slice(0, 2).join(', ')}. Se busca validar la eficacia operativa y el cumplimiento normativo.`,
                    alcance: `El alcance abarca la revisión de ${controls.length} controles clave (${controls.slice(0, 2).join(', ')}) y su aplicación en los procesos de la sede central durante el periodo auditado.`,
                    metodologia: `Se aplicará un enfoque de auditoría basado en riesgos (IBR), utilizando pruebas de cumplimiento y sustantivas sobre la muestra de controles seleccionados para asegurar una opinión técnica fundamentada.`
                }
            });
        }

        if (!text && !field) {
            return NextResponse.json({ error: 'No se proporcionó texto ni campo para procesar.' }, { status: 400 });
        }

        const model = process.env.LLM_MODEL || 'mistral-7b';
        const useSystemRole = process.env.LLM_SYSTEM_ROLE !== 'false';

        const systemInstruction = `Eres un experto auditor AML/CFT (Anti-Money Laundering) de República Dominicana. Tu tarea es redactar o refinar contenido técnico para un "Acta de Inicio de Auditoría" bajo la Ley 155-17.

REGLAS OBLIGATORIAS:
1. RESPONDE SIEMPRE EN ESPAÑOL. Nunca respondas en inglés ni en otro idioma.
2. Mantén el contenido entre 10 y 600 caracteres.
3. Usa un tono formal, ejecutivo y técnico.
4. Si recibes un texto existente, úsalo como contexto para reescribir una versión mejorada. NO repitas el texto tal cual.
5. Si el texto está vacío, genera una propuesta estándar profesional para el campo solicitado.
6. NO incluyas saludos, encabezados, explicaciones ni etiquetas. SOLO el párrafo redactado en español.
7. NO uses formato Markdown ni viñetas. Escribe texto plano corrido.`;

        const userContent = `Campo: "${field}".
Contexto/Texto Base: "${text || 'Ninguno, genera una propuesta estándar'}".

Genera el contenido para este campo.`;

        // Build messages array respecting LLM_SYSTEM_ROLE env var
        const messages = useSystemRole
            ? [
                { role: 'system' as const, content: systemInstruction },
                { role: 'user' as const, content: userContent }
            ]
            : [
                { role: 'user' as const, content: `${systemInstruction}\n\n${userContent}` }
            ];

        try {
            console.log(`[AI] Calling LLM model="${model}" field="${field}" textLen=${text?.length || 0} systemRole=${useSystemRole}`);
            const response = await llmStudioChat({ model, messages });

            if (!response.ok) {
                console.error('LLM Error:', response.status, await response.text());
                throw new Error('Error en la comunicación con el modelo local.');
            }

            const data = await response.json();
            const refinedText = data.choices?.[0]?.message?.content?.trim() || 'Error al generar contenido.';

            return NextResponse.json({ refinedText });
        } catch (error) {
            console.error('AI Generation Error:', error);
            return NextResponse.json({ error: 'Error al procesar la solicitud con IA local.' }, { status: 500 });
        }

    } catch (error) {
        console.error('AI Refinement Error:', error);
        return NextResponse.json({ error: 'Error al procesar el refinamiento con IA.' }, { status: 500 });
    }
}
