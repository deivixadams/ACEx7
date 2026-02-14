
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

        // Handle AI-assisted evaluation finding generation
        if (type === 'hallazgo_evaluation' && context) {
            const { controlName, controlDescription, criticidad, complianceState, risks: ctxRisks, tests: ctxTests } = context;

            const risksBlock = (ctxRisks || []).map((r: any, i: number) =>
                `  ${i + 1}. "${r.descripcion}" — Tipo: ${r.tipo || 'N/A'}, Nivel: ${r.nivel_riesgo || 'N/A'}, Impacto: ${r.impacto || 'N/A'}`
            ).join('\n') || '  (Ninguno)';

            const testsBlock = (ctxTests || []).map((t: any, i: number) =>
                `  ${i + 1}. "${t.nombre}"${t.como_hacer ? ` — Pasos: ${t.como_hacer}` : ''}${t.evidencia_minima ? ` — Evidencia: ${t.evidencia_minima}` : ''}${t.criterio_aceptacion ? ` — Criterio: ${t.criterio_aceptacion}` : ''}`
            ).join('\n') || '  (Ninguna)';

            const complianceLabel = complianceState === 'cumple' ? 'CUMPLE'
                : complianceState === 'no_cumple' ? 'NO CUMPLE'
                    : complianceState === 'parcial' ? 'CUMPLE PARCIALMENTE'
                        : 'AÚN NO EVALUADO';

            const hasExistingText = text && text.trim().length >= 3;

            const model = process.env.LLM_MODEL || 'mistral-7b';
            const useSystemRole = process.env.LLM_SYSTEM_ROLE !== 'false';

            const systemPrompt = `Eres un auditor senior especializado en AML/CFT (Ley 155-17, República Dominicana). Tu tarea es redactar hallazgos de auditoría profesionales y técnicos.

REGLAS OBLIGATORIAS:
1. RESPONDE SIEMPRE Y ÚNICAMENTE EN ESPAÑOL.
2. Redacta entre 80 y 800 caracteres.
3. Tono: formal, técnico, ejecutivo. Como un hallazgo de un informe de auditoría real.
4. NO incluyas saludos, encabezados, explicaciones, etiquetas ni formato Markdown. SOLO el texto corrido del hallazgo.
5. Estructura recomendada: (a) Condición observada, (b) Criterio o norma aplicable, (c) Causa probable, (d) Efecto o riesgo derivado, (e) Recomendación.
6. Si el dictamen es CUMPLE, redacta una observación positiva confirmando la efectividad del control.
7. Si el dictamen es NO CUMPLE o PARCIAL, identifica la brecha y proporciona una recomendación concreta.`;

            const userPrompt = `CONTEXTO DE EVALUACIÓN:
- Control evaluado: "${controlName}"
- Descripción: "${controlDescription || 'Sin descripción detallada'}"
- Criticidad: ${criticidad || 'No definida'}
- Dictamen de auditoría: ${complianceLabel}

RIESGOS ASOCIADOS:
${risksBlock}

PROCEDIMIENTOS DE PRUEBA:
${testsBlock}

${hasExistingText
                    ? `TEXTO DEL AUDITOR (mejora y complementa esto profesionalmente):\n"${text}"`
                    : `No hay texto previo. Genera un hallazgo profesional completo basado en el contexto proporcionado y el dictamen ${complianceLabel}.`
                }

Redacta el hallazgo de auditoría:`;

            const messages = useSystemRole
                ? [
                    { role: 'system' as const, content: systemPrompt },
                    { role: 'user' as const, content: userPrompt }
                ]
                : [
                    { role: 'user' as const, content: `${systemPrompt}\n\n${userPrompt}` }
                ];

            try {
                console.log(`[AI] Hallazgo evaluation: control="${controlName}" compliance="${complianceState}" hasText=${hasExistingText}`);
                const response = await llmStudioChat({ model, messages });

                if (!response.ok) {
                    console.error('LLM Error:', response.status, await response.text());
                    throw new Error('Error en la comunicación con el modelo local.');
                }

                const data = await response.json();
                const refinedText = data.choices?.[0]?.message?.content?.trim() || 'Error al generar contenido.';

                return NextResponse.json({ refinedText });
            } catch (error) {
                console.error('AI Hallazgo Error:', error);
                return NextResponse.json({ error: 'Error al procesar el hallazgo con IA.' }, { status: 500 });
            }
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
