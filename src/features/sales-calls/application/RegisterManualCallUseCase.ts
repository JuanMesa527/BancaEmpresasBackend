import { randomUUID } from 'node:crypto';
import type { PipelineStageAdvancer } from '../../../shared/contracts/pipeline.js';
import { normalizeLeadId } from '../../../core/pipeline/domain/normalize-lead-id.js';
import type { PipelineCaseRepository } from '../../../core/pipeline/domain/pipeline-case.repository.js';
import type { Call } from '../domain/Call.js';
import type { CallRepository } from '../domain/CallRepository.js';
import { isCallQualified } from '../domain/qualification.js';

const MANUAL_AGENT_ID = 'asesor-manual';

export interface RegisterManualCallRequest {
  phoneNumber?: string;
  customerName: string;
  customerEmail?: string;
  variables: {
    empresa: string;
    nit: string;
  };
  identidadVerificada: boolean;
  clienteInteresado: boolean;
  motivoNoInteres?: string;
  summary?: string;
  durationSeconds?: number;
}

export class RegisterManualCallUseCase {
  constructor(
    private readonly callRepository: CallRepository,
    private readonly pipelineCases: PipelineCaseRepository,
    private readonly pipeline: PipelineStageAdvancer,
  ) {}

  async execute(request: RegisterManualCallRequest): Promise<Call> {
    const leadId = normalizeLeadId(request.variables.nit.trim());
    const pipelineCase = await this.pipelineCases.ensureByLeadId(leadId);
    const now = new Date().toISOString();

    const structuredData: Record<string, unknown> = {
      identidad_verificada: request.identidadVerificada ? 'Verdadero' : 'Falso',
      cliente_interesado: request.clienteInteresado ? 'Verdadero' : 'Falso',
      motivo_no_interes: request.motivoNoInteres?.trim() || 'No aplica',
      canal: 'manual',
    };

    const call: Call = {
      id: randomUUID(),
      caseId: pipelineCase.id,
      agentId: MANUAL_AGENT_ID,
      phoneNumber: request.phoneNumber ?? '+570000000000',
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      variables: {
        empresa: request.variables.empresa.trim(),
        nit: request.variables.nit.trim(),
        canal: 'manual',
      },
      status: 'completed',
      endedReason: 'asesor-manual',
      durationSeconds: request.durationSeconds,
      summary:
        request.summary?.trim() ||
        'Llamada registrada manualmente por un asesor del call center.',
      successEvaluation: request.identidadVerificada && request.clienteInteresado,
      structuredData,
      createdAt: now,
      updatedAt: now,
    };

    await this.callRepository.save(call);

    if (isCallQualified(call)) {
      try {
        await this.pipeline.advance(pipelineCase.id, 'power_apps');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        console.warn(`sales-calls: avance manual a power_apps omitido (${pipelineCase.id}) — ${message}`);
      }
    }

    return call;
  }
}
