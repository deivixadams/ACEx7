
export interface Hallazgo {
    numero: string;
    titulo: string;
    criterio: string;
    condicion: string;
    causa: string;
    efecto_riesgo: string;
    nivel_riesgo: string;
    recomendacion: string;
    respuesta_auditado: string;
    evidencias: string;
    observaciones: string;
}

export interface Reporte {
    empresa: string;
    periodo_inicio: string;
    periodo_fin: string;
    fecha_emision: string;
    resumen_ejecutivo: string;
    objetivos: string;
    alcance: string;
    metodologia: string;
    conclusion_final: string;
    hallazgos: Hallazgo[];
    auditor_nombre: string;
    auditor_cargo: string;
    auditor_firma: string;
    aprobador_nombre: string;
    aprobador_cargo: string;
    aprobador_firma: string;
    fecha_firmas: string;
}

/**
 * Mock function to retrieve report data by ID.
 * Optionally merges user-provided metadata (objetivos, alcance, metodologia).
 */
export async function getReporteById(id: string, metadata?: Partial<Reporte>): Promise<Reporte> {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const baseReport: Reporte = {
        empresa: "SOLUCIONES FINANCIERAS S.A.",
        periodo_inicio: "01/01/2025",
        periodo_fin: "31/12/2025",
        fecha_emision: new Date().toLocaleDateString('es-ES'),
        resumen_ejecutivo: "Se ha realizado la auditoría de cumplimiento AML para el periodo 2025 con resultados satisfactorios en la mayoría de los controles implementados, aunque con áreas de mejora en la debida diligencia de clientes de alto riesgo.",
        objetivos: "Evaluar la eficacia del programa de cumplimiento de prevención de lavado de activos y financiamiento del terrorismo.",
        alcance: "Todos los procesos operativos y de cumplimiento de la sede central y sucursales regionales.",
        metodologia: "Revisiones documentales, entrevistas con el personal clave y pruebas de recorrido sobre el sistema de monitoreo.",
        conclusion_final: "La organización mantiene un nivel de cumplimiento robusto, requiriendo ajustes menores en la documentación de expedientes.",
        hallazgos: [
            {
                numero: "01",
                titulo: "Expedientes de clientes con documentación incompleta",
                criterio: "Normativa AML - Artículo 15 (Debida Diligencia)",
                condicion: "Se detectó que el 5% de la muestra de clientes carece de identificación de beneficiario final actualizada.",
                causa: "Falta de supervisión en el proceso de Onboarding digital.",
                efecto_riesgo: "Posible incumplimiento regulatorio y multas administrativas.",
                nivel_riesgo: "ALTO",
                recomendacion: "Implementar un checklist obligatorio en el sistema antes de proceder con el alta del cliente.",
                respuesta_auditado: "Se acepta el hallazgo y se procederá a la regularización en los próximos 30 días.",
                evidencias: "Reporte de auditoría de sistemas, muestra de 50 expedientes.",
                observaciones: "El equipo de cumplimiento ya había identificado esta brecha parcialmente."
            },
            {
                numero: "02",
                titulo: "Demora en la actualización de listas de sanciones",
                criterio: "Manual de Prevención - Sección 4.2",
                condicion: "La actualización de listas internacionales se realiza cada 48 horas en lugar de cada 24 horas como dicta el manual.",
                causa: "Problemas de conectividad con el proveedor de datos externo.",
                efecto_riesgo: "Riesgo operativo de operar con entidades sancionadas.",
                nivel_riesgo: "MEDIO",
                recomendacion: "Configurar un servidor espejo para asegurar la descarga continua de actualizaciones.",
                respuesta_auditado: "Se está evaluando un cambio de proveedor con mayor SLA.",
                evidencias: "Logs del sistema de filtrado de los meses de octubre y noviembre.",
                observaciones: "No se detectaron coincidencias positivas durante el periodo de desfase."
            }
        ],
        auditor_nombre: "Juan Pérez",
        auditor_cargo: "Auditor Senior AML",
        auditor_firma: "JP",
        aprobador_nombre: "María García",
        aprobador_cargo: "Oficial de Cumplimiento",
        aprobador_firma: "MG",
        fecha_firmas: new Date().toLocaleDateString('es-ES')
    };

    return { ...baseReport, ...metadata };
}
