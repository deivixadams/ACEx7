import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

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

function ddmmyyyy(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}${mm}${yyyy}`;
}

function buildDocx(
  controls: any[],
  results: Record<string, string> | undefined,
  compliance: Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''> | undefined
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

  return new Document({ sections: [{ children }] });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewRequest;
  const controlIds = Array.isArray(body.controlIds) ? body.controlIds : [];
  if (controlIds.length === 0) {
    return NextResponse.json({ error: 'controlIds required' }, { status: 400 });
  }

  const controlsQuery = `
    SELECT id_control, nombre, descripcion
    FROM controls
    WHERE id_control = ANY($1)
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

  const [controlsRes, risksRes, testsRes] = await Promise.all([
    pool.query<ControlRow>(controlsQuery, [controlIds]),
    pool.query<RiskRow>(risksQuery, [controlIds]),
    pool.query<TestRow>(testsQuery, [controlIds]),
  ]);

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
    return NextResponse.json({ controls });
  }

  const doc = buildDocx(controls, body.results, body.compliance);
  const buffer = await Packer.toBuffer(doc);
  const filename = `Cumplimiento-${ddmmyyyy(new Date())}.docx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
