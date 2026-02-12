---
name: Skills-ACEx7
description: Specialized skill for managing the Audit Corpus Engine x7 (ACEx7) AML framework, mapping legal requirements to risks, controls, and tests for the Dominican Republic jurisdiction.
---

# Skills-ACEx7

This skill provides the logic and context for the Audit Corpus Engine x7 (ACEx7), a system designed for AML (Anti-Money Laundering) auditing with a focus on traceability and reproducibility.

## When to use this skill
- When working on the ACEx7 codebase (Node.js, React, Prisma, PostgreSQL).
- When defining or auditing AML legal requirements for República Dominicana.
- When mapping the chain: **Requerimiento → Riesgo → Control → Prueba**.
- When managing the audit corpus (versioning, snapshots, editorial flow).
- When interacting with the `db_app_compliance` database.

## How to use it

### 1. Mandatory Audit Chain Logic
Every audit element must follow this strictly enforced chain:
1.  **Requerimiento (Requirement):** An atomic unit derived from Law 155-17 or best practices.
2.  **Riesgo (Risk):** Compliance risk derived from the requirement.
3.  **Control:** Mitigating state observable for the risk.
4.  **Prueba (Test):** Validation of the control, classified by:
    - **Diseño (Design)**
    - **Implementación (Implementation)**
    - **Efectividad Operativa (Operational Effectiveness)**

### 2. Database Schema Context (PostgreSQL/Prisma)
The skill is aware of all 33 tables in `db_app_compliance`, organized by functional area:

#### Audit Chain (Core Traceability)
- `territory`: Jurisdictions (e.g., República Dominicana).
- `domain`: Regulated domains (AML/FT).
- `module`: Functional modules.
- `requirements`: Atomic legal mandates.
- `risk_by_req`: Risks linked to requirements.
- `controls`: Mitigating controls.
- `risk_controls_link`: Mapping between risks and controls.

#### Testing Framework
- `test_all`: Central test definitions (Design/Impl/Eff).
- `test_automatic`: Metadata for automated verification.
- `test_req_map`: Links tests to requirements.
- `test_control_map`: Links tests to controls.
- `test_classifier`: Test classification criteria.
- `test_detalle`: Detailed test execution data.
- `test_frecuency`: Test frequency definitions.
- `test_schedule`: Test scheduling and calendar.
- `test_trigger`: Event-based test triggers.
- `test_type`: Test type catalog.

#### Audit Operations
- `auditoria`: Audit engagements.
- `usuarios`: **[NEW]** System users with professional profile (phone, address, position) and PBKDF2 secure password hashing.
- `roles`: **[NEW]** Role-based access control (Admin, Auditor Senior/Junior, Operador).
- `auditor`: Individual auditor profiles (Legacy/Complementary).
- `auditor_formacion`: Auditor training/certifications.
- `auditoria_auditor`: Assignment of auditors to audits.

#### Organizational
- `empresa`: Companies / regulated entities. Fields: `id`, `nombre`, `nit`, `activo`.

### 3. Operational & Security Standards
- **World-Class Security:** Passwords must never be stored in plain text. Use PBKDF2 with a 16-byte salt and at least 1000 iterations for hashing.
- **Identity:** The corporate email address acts as the primary `username`.
- **Immutability:** Audits must be executed against a specific, versioned snapshot of the corpus.
- **Defensibility:** Every test result must be traceable back to the original legal requirement and its normative source.

### 4. Technical & Design System
- **Emerald/Slate Design System:** All new components must adhere to the premium "Emerald/Slate" aesthetic. Use `rounded-[2.5rem]` for cards, vibrant emerald accents (`primary`), and sophisticated slate backgrounds.
- **UI Components:** Use high-fidelity "Profile Cards" for identity management and side-entry forms for CRUD operations.
- **DB Migrations:** When `psql` is unavailable in the environment, use Node.js bridge scripts (referencing `lib/db.ts`) to execute SQL migrations.
- **Prisma/SQL:** Refer to the schema structure in the `usuarios` and `roles` tables for all access control logic.
