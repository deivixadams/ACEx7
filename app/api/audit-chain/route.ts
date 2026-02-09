import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const reqId = searchParams.get('reqId');
    const riskId = searchParams.get('riskId');
    const controlId = searchParams.get('controlId');

    try {
        // Basic queries for all entities
        let modulesQuery = 'SELECT id_modulo, nombre, codigo FROM module ORDER BY nombre ASC';
        let reqsQuery = 'SELECT id_requerimiento, titulo as nombre, codigo, id_modulo FROM requirements';
        let risksQuery = 'SELECT id_riesgo, descripcion as nombre, codigo, id_requerimiento FROM risk_by_req';
        let controlsQuery = 'SELECT id_control, nombre, codigo FROM controls';
        let linkRiskControlQuery = 'SELECT id_riesgo, id_control FROM risk_controls_link';
        let testsQuery = 'SELECT id_prueba, codigo_prueba as codigo, nombre, descripcion FROM test_all';
        let testReqMapQuery = 'SELECT prueba_id, requerimiento_id FROM test_req_map';
        let testControlMapQuery = 'SELECT id_prueba, id_control FROM test_control_map';

        const [modules, reqs, risks, controls, links, tests, testReqMaps, testControlMaps] = await Promise.all([
            pool.query(modulesQuery),
            pool.query(reqsQuery),
            pool.query(risksQuery),
            pool.query(controlsQuery),
            pool.query(linkRiskControlQuery),
            pool.query(testsQuery),
            pool.query(testReqMapQuery),
            pool.query(testControlMapQuery)
        ]);

        return NextResponse.json({
            modules: modules.rows,
            requirements: reqs.rows,
            risks: risks.rows,
            controls: controls.rows,
            links: links.rows,
            tests: tests.rows,
            testReqMaps: testReqMaps.rows,
            testControlMaps: testControlMaps.rows
        });
    } catch (error: any) {
        console.error('Audit Chain API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch audit chain data', details: error.message }, { status: 500 });
    }
}
