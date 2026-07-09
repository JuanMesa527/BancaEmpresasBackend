import { randomUUID } from 'node:crypto';
import type { PowerAppRequest } from '../domain/power-app-request.js';
import { validatePowerAppRequest } from '../domain/power-app-validator.js';
import type { PowerAppDecision, ValidationIssue } from '../domain/validation-issue.js';
import type { SubmitPowerAppDto } from './dtos/submit-power-app.dto.js';

export interface SubmitPowerAppResult {
  caseId: string;
  decision: PowerAppDecision;
  valid: boolean;
  radicado: string | null;
  issues: ValidationIssue[];
  summary: string;
  siguientePaso: string | null;
  submittedAt: string;
}

function mapDtoToRequest(dto: SubmitPowerAppDto): PowerAppRequest {
  return {
    leadId: dto.leadId,
    campana: dto.campana,
    empresa: {
      ...dto.empresa,
      nit: dto.empresa.nit,
    },
    tarjetahabiente: dto.tarjetahabiente,
    cupo: dto.cupo,
    entrega: dto.entrega,
    camaraComercio: dto.camaraComercio,
    producto: {
      codigo: dto.producto.codigo.toUpperCase(),
      franquicia: dto.producto.franquicia.toUpperCase(),
    },
    asesorId: dto.asesorId,
  };
}

function buildRadicado(): string {
  const year = new Date().getFullYear();
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `GOPTC-${year}-${suffix}`;
}

function resolveDecision(issues: ValidationIssue[]): PowerAppDecision {
  const hasErrors = issues.some((i) => i.severity === 'error');
  if (!hasErrors) return 'APROBADO';

  const hasSwap = issues.some((i) => i.code === 'FIELD_SWAP_NIT_CEDULA');
  if (hasSwap) return 'DEVUELTO';

  return 'RECHAZADO';
}

function buildSummary(decision: PowerAppDecision, errorCount: number, warningCount: number): string {
  if (decision === 'APROBADO') {
    return warningCount > 0
      ? `Solicitud aprobada con ${warningCount} advertencia(s). Operaciones puede iniciar realce y entrega.`
      : 'Solicitud aprobada. Operaciones puede iniciar realce y entrega de la tarjeta.';
  }

  if (decision === 'DEVUELTO') {
    return `Solicitud devuelta: se detectaron ${errorCount} error(es) corregibles (posible intercambio de datos).`;
  }

  return `Solicitud rechazada: se encontraron ${errorCount} error(es) que impiden continuar.`;
}

export function submitPowerAppUseCase(dto: SubmitPowerAppDto): SubmitPowerAppResult {
  const request = mapDtoToRequest(dto);
  const issues = validatePowerAppRequest(request);
  const decision = resolveDecision(issues);
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const approved = decision === 'APROBADO';

  return {
    caseId: randomUUID(),
    decision,
    valid: approved,
    radicado: approved ? buildRadicado() : null,
    issues,
    summary: buildSummary(decision, errorCount, warningCount),
    siguientePaso: approved
      ? 'Operaciones procesará realce, fabricación y envío. El gerente comercial hará entrega del plástico.'
      : decision === 'DEVUELTO'
        ? 'Corrija los campos señalados y vuelva a enviar la solicitud.'
        : 'Revise los errores reportados antes de reintentar.',
    submittedAt: new Date().toISOString(),
  };
}
