import { normalizeLeadId } from '../../../core/pipeline/domain/normalize-lead-id.js';
import type { PipelineCaseRepository } from '../../../core/pipeline/domain/pipeline-case.repository.js';
import {
  PIPELINE_ORDER,
  type PipelineStage,
  type PipelineStageAdvancer,
} from '../../../shared/contracts/pipeline.js';
import { NotFoundError, ValidationError } from '../../../shared/exceptions/app-error.js';
import type { CallRepository } from '../domain/CallRepository.js';
import { isCallQualified } from '../domain/qualification.js';

export interface SyncQualifiedCallPipelineResult {
  callId: string;
  caseId: string;
  stage: PipelineStage;
  advanced: boolean;
  alreadyAtOrPastPowerApps: boolean;
}

/**
 * Recuperación idempotente: si una llamada calificada no avanzó el pipeline
 * (p. ej. se inició sin caseId o el webhook falló en silencio), asegura el caso
 * por NIT y mueve pipeline_cases.stage → power_apps.
 *
 * Misma regla de negocio que HandleCallWebhookUseCase.advancePipelineIfQualified,
 * expuesta como endpoint para que el front recupere casos atascados.
 */
export class SyncQualifiedCallPipelineUseCase {
  constructor(
    private readonly callRepository: CallRepository,
    private readonly pipelineCases: PipelineCaseRepository,
    private readonly pipeline: PipelineStageAdvancer,
  ) {}

  async execute(callId: string): Promise<SyncQualifiedCallPipelineResult> {
    const call = await this.callRepository.findById(callId);
    if (!call) {
      throw new NotFoundError('Llamada no encontrada');
    }
    if (!isCallQualified(call)) {
      throw new ValidationError('La llamada no está calificada para avanzar a Power App');
    }

    const nit = call.variables?.['nit']?.trim();
    let caseId = call.caseId;
    let stageBefore: PipelineStage | undefined;

    if (nit) {
      const pipelineCase = await this.pipelineCases.ensureByLeadId(normalizeLeadId(nit));
      caseId = pipelineCase.id;
      stageBefore = pipelineCase.stage;
      if (call.caseId !== caseId) {
        call.caseId = caseId;
        call.updatedAt = new Date().toISOString();
        await this.callRepository.save(call);
      }
    } else if (!caseId) {
      throw new ValidationError(
        'La llamada no tiene caseId ni NIT; no se puede correlacionar con el pipeline',
      );
    }

    const powerAppsIndex = PIPELINE_ORDER.indexOf('power_apps');
    const currentIndex = stageBefore ? PIPELINE_ORDER.indexOf(stageBefore) : -1;
    const alreadyAtOrPastPowerApps = currentIndex >= powerAppsIndex;

    if (alreadyAtOrPastPowerApps && stageBefore) {
      return {
        callId: call.id,
        caseId: caseId!,
        stage: stageBefore,
        advanced: false,
        alreadyAtOrPastPowerApps: true,
      };
    }

    await this.pipeline.advance(caseId!, 'power_apps');

    return {
      callId: call.id,
      caseId: caseId!,
      stage: 'power_apps',
      advanced: true,
      alreadyAtOrPastPowerApps: false,
    };
  }
}
