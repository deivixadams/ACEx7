import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { llmStudioChat } from '@/lib/llm/llmstudio';

type ReviewRequest = {
  controlIds?: string[];
  download?: boolean;
  results?: Record<string, string>;
  compliance?: Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>;
};

type ControlRow = {
  id_control: string;
  nombre: string;
  descripcion: string | null;
  criticidad: number | null;
  criticidad_etiqueta: string | null;
};

type RiskRow = {
  id_control: string;
  id_riesgo: string;
  descripcion: string | null;
  tipo: string | null;
  impacto: string | null;
  probabilidad: string | null;
  nivel_riesgo: string | null;
};

type TestRow = {
  id_control: string;
  id_prueba: string;
  nombre: string;
  codigo_prueba: string | null;
  descripcion: string | null;
  como_hacer_la_prueba: string | null;
  evidencia_minima: string | null;
  fuente_evidencia: string | null;
  criterio_aceptacion: string | null;
  muestreo_sugerido: string | null;
};

async function writeControlLog(params: {
  controlIds: string[];
  stage: string;
  status: 'start' | 'ok' | 'error';
  message?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}) {
  try {
    await pool.query(
      `insert into control_log (control_ids, stage, status, message, duration_ms, metadata)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        params.controlIds.join(','),
        params.stage,
        params.status,
        params.message || null,
        params.durationMs ?? null,
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch {
    // Avoid breaking main flow if logging fails.
  }
}

function ddmmyyyy(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}${mm}${yyyy}`;
}

function computeMaturity(
  controls: any[],
  compliance: Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''> | undefined
) {
  const total = controls.length;
  if (total === 0) return { ic: 0, score: 1, gatingReason: '' };

  let sum = 0;
  let noCumpleCount = 0;
  let hasCriticalNoCumple = false;

  controls.forEach((c) => {
    const state = compliance?.[c.id_control] || '';
    if (state === 'cumple') sum += 1.0;
    if (state === 'parcial') sum += 0.5;
    if (state === 'no_cumple') {
      sum += 0.0;
      noCumpleCount += 1;
      if (c.criticidad === 2) hasCriticalNoCumple = true;
    }
    if (state === '') sum += 0.0;
  });

  const ic = sum / total;

  if (noCumpleCount / total > 0.3) {
    return { ic, score: 1, gatingReason: 'Mas del 30% No cumple' };
  }

  let score = 1;
  if (ic >= 0.9) score = 5;
  else if (ic >= 0.75) score = 4;
  else if (ic >= 0.6) score = 3;
  else if (ic >= 0.4) score = 2;
  else score = 1;

  if (hasCriticalNoCumple && score > 2) {
    return { ic, score: 2, gatingReason: 'No cumple en control critico' };
  }

  return { ic, score, gatingReason: '' };
}

async function generateConclusion(params: {
  ic: number;
  score: number;
  gatingReason: string;
  total: number;
  counts: { cumple: number; parcial: number; noCumple: number };
}) {
  const { ic, score, gatingReason, total, counts } = params;
  const model =
    process.env.LLM_MODEL || process.env.OLLAMA_MODEL || 'deepseek-r1-7b';

  const system =
    process.env.GUIAS_REVISION_SYSTEM_PROMPT ||
    'Eres un auditor AML. Redacta una conclusión breve (entre 1 y 5 párrafos) en español formal, sin anglicismos ni errores ortográficos. Usa terminología AML/FT correcta y evita abreviaturas informales. Entrega solo el texto final en español. No incluyas razonamientos, notas internas ni etiquetas como <think>.';

  const user = [
    `Total controles: ${total}`,
    `Cumple: ${counts.cumple}`,
    `Cumple parcial: ${counts.parcial}`,
    `No cumple: ${counts.noCumple}`,
    `Indice de Cumplimiento (IC): ${ic.toFixed(2)}`,
    `Modelo de Madurez: ${score}`,
    gatingReason ? `Regla aplicada: ${gatingReason}` : 'Regla aplicada: ninguna',
  ].join('\n');

  try {
    const supportsSystemRole = process.env.LLM_SYSTEM_ROLE !== 'false';
    const messages = supportsSystemRole
      ? [
          { role: 'system', content: system },
          { role: 'user', content: `Datos para la conclusión:\n${user}` },
        ]
      : [
          {
            role: 'user',
            content: `${system}\n\nDatos para la conclusión:\n${user}`,
          },
        ];

    const r = await llmStudioChat({
      model,
      stream: false,
      messages,
    });

    if (!r.ok) return '';
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || data?.message?.content || '';
    return String(text)
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  } catch {
    return '';
  }
}

function buildDocx(
  controls: any[],
  results: Record<string, string> | undefined,
  compliance: Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''> | undefined,
  conclusion: string
) {
  const now = new Date();
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: 'MI EMPRESA',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );
  children.push(
    new Paragraph({
      text: 'Cumplimiento Normativo para Controles',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Fecha - Espacio la Hora: ', bold: true }),
        new TextRun({ text: now.toLocaleString('es-DO') }),
      ],
      spacing: { after: 300 },
    })
  );

  controls.forEach((control: any) => {
    children.push(
      new Paragraph({
        text: `Nombre del control: ${control.nombre}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 120 },
      })
    );

    if (control.descripcion) {
      children.push(
        new Paragraph({
          text: control.descripcion,
          spacing: { after: 120 },
        })
      );
    }

    children.push(
      new Paragraph({
        text: 'Riesgo(s) asociado(s):',
        heading: HeadingLevel.HEADING_4,
        spacing: { after: 80 },
      })
    );
    if (control.riesgos?.length) {
      control.riesgos.forEach((r: any) => {
        const parts = [r.descripcion, r.tipo, r.nivel_riesgo].filter(Boolean).join(' | ');
        children.push(
          new Paragraph({
            text: `- ${parts || r.id_riesgo}`,
          })
        );
      });
    } else {
      children.push(new Paragraph({ text: '- Sin riesgos asociados' }));
    }

    children.push(
      new Paragraph({
        text: 'Detalle de la prueba:',
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 120, after: 80 },
      })
    );
    if (control.pruebas?.length) {
      control.pruebas.forEach((t: any) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${t.nombre || 'Prueba'}${t.codigo_prueba ? ` (${t.codigo_prueba})` : ''}`, bold: true }),
            ],
          })
        );
        const detailLines = [
          t.como_hacer_la_prueba && `Como hacer la prueba: ${t.como_hacer_la_prueba}`,
          t.evidencia_minima && `Evidencia minima: ${t.evidencia_minima}`,
          t.fuente_evidencia && `Fuente evidencia: ${t.fuente_evidencia}`,
          t.criterio_aceptacion && `Criterio aceptacion: ${t.criterio_aceptacion}`,
          t.muestreo_sugerido && `Muestreo sugerido: ${t.muestreo_sugerido}`,
          t.descripcion && `Descripcion: ${t.descripcion}`,
        ].filter(Boolean);

        if (detailLines.length === 0) {
          children.push(new Paragraph({ text: 'Sin detalle disponible.' }));
        } else {
          detailLines.forEach((line) => children.push(new Paragraph({ text: `- ${line}` })));
        }
      });
    } else {
      children.push(new Paragraph({ text: 'Sin pruebas asociadas.' }));
    }

    const resultText = results?.[control.id_control] || '';
    const complianceValue = compliance?.[control.id_control] || '';
    const complianceLabel =
      complianceValue === 'cumple'
        ? 'Cumple'
        : complianceValue === 'no_cumple'
        ? 'No cumple'
        : complianceValue === 'parcial'
        ? 'Cumple parcial'
        : 'Sin evaluar';
    children.push(
      new Paragraph({
        text: 'Resultado de evaluacion (max 2000 caracteres):',
        spacing: { before: 120, after: 40 },
      })
    );
    children.push(
      new Paragraph({
        text: `Estado: ${complianceLabel}`,
        spacing: { after: 40 },
      })
    );
    children.push(
      new Paragraph({
        text: resultText || '______________________________',
        spacing: { after: 200 },
      })
    );
  });

  const maturity = computeMaturity(controls, compliance);
  children.push(
    new Paragraph({
      text: 'Conclusiones',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    })
  );
  children.push(
    new Paragraph({
      text: `Indice de Cumplimiento (IC): ${maturity.ic.toFixed(2)}`,
      spacing: { after: 80 },
    })
  );
  children.push(
    new Paragraph({
      text: `Modelo de Madurez: ${maturity.score}`,
      spacing: { after: 80 },
    })
  );
  if (maturity.gatingReason) {
    children.push(
      new Paragraph({
        text: `Regla aplicada: ${maturity.gatingReason}`,
        spacing: { after: 80 },
      })
    );
  }
  if (conclusion) {
    children.push(
      new Paragraph({
        text: conclusion,
        spacing: { after: 80 },
      })
    );
  }

  return new Document({ sections: [{ children }] });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewRequest;
  const controlIds = Array.isArray(body.controlIds) ? body.controlIds : [];
  if (controlIds.length === 0) {
    return NextResponse.json({ error: 'controlIds required' }, { status: 400 });
  }

  await writeControlLog({
    controlIds,
    stage: 'request',
    status: 'start',
    message: 'review-guides request started',
  });

  const controlsQuery = `
    SELECT c.id_control, c.nombre, c.descripcion, c.criticidad, cc.etiqueta as criticidad_etiqueta
    FROM controls c
    LEFT JOIN Criticidad_Control cc ON cc.valor = c.criticidad
    WHERE c.id_control = ANY($1)
    ORDER BY nombre ASC
  `;
  const risksQuery = `
    SELECT rc.id_control, r.id_riesgo, r.descripcion, r.tipo, r.impacto, r.probabilidad, r.nivel_riesgo
    FROM risk_controls_link rc
    JOIN risk_by_req r ON r.id_riesgo = rc.id_riesgo
    WHERE rc.id_control = ANY($1)
  `;
  const testsQuery = `
    SELECT tcm.id_control, t.id_prueba, t.nombre, t.codigo_prueba, t.descripcion,
           td.como_hacer_la_prueba, td.evidencia_minima, td.fuente_evidencia,
           td.criterio_aceptacion, td.muestreo_sugerido
    FROM test_control_map tcm
    JOIN test_all t ON t.id_prueba = tcm.id_prueba
    LEFT JOIN test_detalle td ON td.id_prueba = t.id_prueba
    WHERE tcm.id_control = ANY($1)
  `;

  const dataStart = Date.now();
  let controlsRes;
  let risksRes;
  let testsRes;
  try {
    [controlsRes, risksRes, testsRes] = await Promise.all([
      pool.query<ControlRow>(controlsQuery, [controlIds]),
      pool.query<RiskRow>(risksQuery, [controlIds]),
      pool.query<TestRow>(testsQuery, [controlIds]),
    ]);
    await writeControlLog({
      controlIds,
      stage: 'data',
      status: 'ok',
      durationMs: Date.now() - dataStart,
      metadata: {
        controls: controlsRes.rowCount,
        risks: risksRes.rowCount,
        tests: testsRes.rowCount,
      },
    });
  } catch (err: any) {
    await writeControlLog({
      controlIds,
      stage: 'data',
      status: 'error',
      durationMs: Date.now() - dataStart,
      message: err?.message || 'data query failed',
    });
    throw err;
  }

  const risksByControl = new Map<string, RiskRow[]>();
  risksRes.rows.forEach((r) => {
    const list = risksByControl.get(r.id_control) || [];
    list.push(r);
    risksByControl.set(r.id_control, list);
  });

  const testsByControl = new Map<string, TestRow[]>();
  testsRes.rows.forEach((t) => {
    const list = testsByControl.get(t.id_control) || [];
    list.push(t);
    testsByControl.set(t.id_control, list);
  });

  const controls = controlsRes.rows.map((c) => ({
    ...c,
    riesgos: risksByControl.get(c.id_control) || [],
    pruebas: testsByControl.get(c.id_control) || [],
  }));

  if (!body.download) {
    await writeControlLog({
      controlIds,
      stage: 'response',
      status: 'ok',
      message: 'review data returned',
    });
    return NextResponse.json({ controls });
  }

  const maturity = computeMaturity(controls, body.compliance);
  const counts = {
    cumple: 0,
    parcial: 0,
    noCumple: 0,
  };
  controls.forEach((c) => {
    const state = body.compliance?.[c.id_control] || '';
    if (state === 'cumple') counts.cumple += 1;
    else if (state === 'parcial') counts.parcial += 1;
    else if (state === 'no_cumple') counts.noCumple += 1;
  });
  const llmStart = Date.now();
  const conclusion = await generateConclusion({
    ic: maturity.ic,
    score: maturity.score,
    gatingReason: maturity.gatingReason,
    total: controls.length,
    counts,
  });
  await writeControlLog({
    controlIds,
    stage: 'llm',
    status: 'ok',
    durationMs: Date.now() - llmStart,
    metadata: { hasConclusion: Boolean(conclusion) },
  });
  const docStart = Date.now();
  const doc = buildDocx(controls, body.results, body.compliance, conclusion);
  const buffer = await Packer.toBuffer(doc);
  await writeControlLog({
    controlIds,
    stage: 'docx',
    status: 'ok',
    durationMs: Date.now() - docStart,
  });
  const filename = `Cumplimiento-${ddmmyyyy(new Date())}.docx`;

  await writeControlLog({
    controlIds,
    stage: 'response',
    status: 'ok',
    message: 'docx generated',
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
