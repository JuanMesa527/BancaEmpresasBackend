import { randomUUID } from 'node:crypto';
import { normalizeLeadId } from '../../../core/pipeline/domain/normalize-lead-id.js';
import type { PipelineCaseRepository } from '../../../core/pipeline/domain/pipeline-case.repository.js';
import type { Call } from '../domain/Call.js';
import type { CallRepository } from '../domain/CallRepository.js';
import type { FonemaGateway } from '../domain/FonemaGateway.js';

export interface InitiateCallRequest {
  phoneNumber: string;
  customerName?: string;
  customerEmail?: string;
  script?: string;
  variables?: Record<string, string>;
  delaySeconds?: number;
  /** Caso del pipeline; se persiste en la llamada para el auto-avance a power_apps. */
  caseId?: string;
}

export class InitiateCallUseCase {
  constructor(
    private readonly fonemaGateway: FonemaGateway,
    private readonly callRepository: CallRepository,
    private readonly defaultAgentId: string,
    private readonly pipelineCases?: PipelineCaseRepository,
  ) {}

  async execute(request: InitiateCallRequest): Promise<Call> {
    const variableValues = { ...request.variables };
    if (request.script) {
      variableValues.script = request.script;
    }

    const caseId = await this.resolveCaseId(request.caseId, variableValues.nit);

    const result = await this.fonemaGateway.initiateCall({
      agentId: this.defaultAgentId,
      phoneNumber: request.phoneNumber,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      variableValues,
      delaySeconds: request.delaySeconds,
    });

    const now = new Date().toISOString();
    const call: Call = {
      id: randomUUID(),
      sessionId: result.sessionId,
      caseId,
      agentId: this.defaultAgentId,
      phoneNumber: request.phoneNumber,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      script: request.script,
      variables: variableValues,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    };

    await this.callRepository.save(call);
    return call;
  }

  /**
   * Si el caller no envió caseId pero hay NIT en variables, asegura el caso
   * del pipeline para que el webhook pueda auto-avanzar a power_apps.
   */
  private async resolveCaseId(
    explicitCaseId: string | undefined,
    nit: string | undefined,
  ): Promise<string | undefined> {
    if (explicitCaseId) {
      return explicitCaseId;
    }
    if (!this.pipelineCases || !nit?.trim()) {
      return undefined;
    }
    try {
      const pipelineCase = await this.pipelineCases.ensureByLeadId(normalizeLeadId(nit));
      return pipelineCase.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      console.warn(`sales-calls: no se pudo asegurar pipeline case para NIT ${nit} — ${message}`);
      return undefined;
    }
  }
}
