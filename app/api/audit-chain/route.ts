import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const reqId = searchParams.get('reqId');
    const riskId = searchParams.get('riskId');
    const controlId = searchParams.get('controlId');
    const debugSchema = searchParams.get('debugSchema');

    if (debugSchema === 'true') {
        try {
            const schemaQuery = `
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name IN (
                    'accion_evidencia', 'audit_log', 'auditor', 'auditor_formacion', 
                    'auditoria', 'auditoria_auditor', 'cat_estado_accion', 
                    'cat_estado_auditoria', 'cat_estado_hallazgo', 'cat_severidad', 
                    'cat_tipo_riesgo', 'empresa', 'formacion', 'hallazgo', 
                    'hallazgo_accion', 'hallazgo_evidencia'
                )
                ORDER BY table_name, ordinal_position;
            `;
            const result = await pool.query(schemaQuery);
            return NextResponse.json({ schema: result.rows });
        } catch (error: any) {
            return NextResponse.json({ error: 'Schema query failed', details: error.message }, { status: 500 });
        }
    }

    try {
        // Basic queries for all entities
        let modulesQuery = 'SELECT id_modulo, nombre, codigo FROM module ORDER BY nombre ASC';
        let reqsQuery = 'SELECT id_requerimiento, titulo as nombre, codigo, id_modulo, descripcion, categoria, base_normativa, source_ref, nivel_riesgo FROM requirements';
        let risksQuery = 'SELECT id_riesgo, descripcion as nombre, codigo, id_requerimiento, tipo, impacto, probabilidad, nivel_riesgo, descripcion as descripcion_full FROM risk_by_req';
        let controlsQuery = 'SELECT id_control, nombre, codigo, tipo_control, naturaleza, frecuencia, descripcion, evidencia_esperada FROM controls';
        let linkRiskControlQuery = 'SELECT id_riesgo, id_control FROM risk_controls_link';
        let testsQuery = 'SELECT id_prueba, codigo_prueba as codigo, nombre, descripcion FROM test_all';
        let testReqMapQuery = 'SELECT prueba_id, requerimiento_id FROM test_req_map';
        let testControlMapQuery = 'SELECT id_prueba, id_control FROM test_control_map';

        // Summary View Queries
        const summaryQueries = {
            riskTypes: 'SELECT tipo as name, COUNT(*) as value FROM risk_by_req GROUP BY tipo',
            controlTypes: 'SELECT tipo_control as name, COUNT(*) as value FROM controls GROUP BY tipo_control',
            testReqsCount: 'SELECT COUNT(*) as count FROM test_req_map',
            testControlsCount: 'SELECT COUNT(*) as count FROM test_control_map',
            // Audit List with joins
            // audit_log, auditor, auditoria, auditoria_auditor, cat_estado_accion, cat_estado_auditoria
            // Using LEFT JOINs to be safe
            auditList: `
                SELECT 
                    a.id, 
                    a.codigo, 
                    a.fecha_inicio, 
                    a.riesgo_general, 
                    a.objetivo,
                    ce.nombre as estado,
                    au.nombre as auditor_lider
                FROM auditoria a
                LEFT JOIN cat_estado_auditoria ce ON a.estado_id = ce.id
                LEFT JOIN auditor au ON a.auditor_lider_id = au.id
                ORDER BY a.fecha_inicio DESC
                LIMIT 10
            `
        };

        const [modules, reqs, risks, controls, links, tests, testReqMaps, testControlMaps,
            riskTypesRes, controlTypesRes, testReqsCountRes, testControlsCountRes, auditListRes] = await Promise.all([
                pool.query(modulesQuery),
                pool.query(reqsQuery),
                pool.query(risksQuery),
                pool.query(controlsQuery),
                pool.query(linkRiskControlQuery),
                pool.query(testsQuery),
                pool.query(testReqMapQuery),
                pool.query(testControlMapQuery),
                pool.query(summaryQueries.riskTypes),
                pool.query(summaryQueries.controlTypes),
                pool.query(summaryQueries.testReqsCount),
                pool.query(summaryQueries.testControlsCount),
                pool.query(summaryQueries.auditList)
            ]);

        return NextResponse.json({
            modules: modules.rows,
            requirements: reqs.rows,
            risks: risks.rows,
            controls: controls.rows,
            links: links.rows,
            tests: tests.rows,
            testReqMaps: testReqMaps.rows,
            testControlMaps: testControlMaps.rows,
            summary: {
                totalReqs: reqs.rowCount,
                totalRisks: risks.rowCount,
                totalControls: controls.rowCount,
                riskTypes: riskTypesRes.rows,
                controlTypes: controlTypesRes.rows,
                testDistribution: [
                    { name: 'Pruebas de Requerimiento', value: parseInt(testReqsCountRes.rows[0].count) },
                    { name: 'Pruebas de Control', value: parseInt(testControlsCountRes.rows[0].count) }
                ],
                auditList: auditListRes.rows
            }
        });
    } catch (error: any) {
        console.error('Audit Chain API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch audit chain data', details: error.message }, { status: 500 });
    }
}
