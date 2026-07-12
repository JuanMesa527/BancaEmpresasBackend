import type { PipelineStageAdvancer } from '../../../shared/contracts/pipeline.js';
import type { PipelineCaseRepository } from '../../../core/pipeline/domain/pipeline-case.repository.js';
import type { Call, CallStatus, TranscriptMessage } from '../domain/Call.js';
import type { CallRepository } from '../domain/CallRepository.js';
import type { CallBatchRepository } from '../domain/CallBatchRepository.js';
import { isCallQualified } from '../domain/qualification.js';


export interface CallUpdatePayload {
  event?: string;
  status?: string;
  timestamp?: string;
  call?: { id?: string };
  customer?: { name?: string; phoneNumber?: string };
}

export interface EndOfCallPayload {
  id?: string;
  session?: { id?: string };
  startedAt?: string;
  endedReason?: string;
  messages?: TranscriptMessage[];
  customer?: { name?: string; phoneNumber?: string };
  variableValues?: Record<string, string>;
  durationSeconds?: number;
  detailsURL?: string;
  recordingURL?: string;
  analysis?: {
    successEvaluation?: boolean | string;
    structuredData?: Record<string, unknown>;
    summary?: string;
  };
}

export interface EndOfSessionPayload {
  customer?: { name?: string; phoneNumber?: string };
  variableValues?: Record<string, string>;
  totalAttempts?: number;
  endedReason?: string;
  analysis?: {
    successEvaluation?: boolean | string;
    structuredData?: Record<string, unknown>;
  };
}

export class HandleCallWebhookUseCase {
  constructor(
    private readonly callRepository: CallRepository,
    private readonly batchRepository?: CallBatchRepository,
    private readonly pipeline?: PipelineStageAdvancer,
    private readonly pipelineCases?: PipelineCaseRepository,
  ) {}

  async handleCallUpdate(payload: CallUpdatePayload): Promise<void> {
    const callId = payload.call?.id;
    if (!callId) {
      return;
    }

    const call = await this.callRepository.findByFonemaCallId(callId);
    if (!call) {
      return;
    }

    call.status = this.mapStatus(payload.status);
    call.updatedAt = new Date().toISOString();
    await this.callRepository.save(call);

    if (call.status === 'in_progress' && this.batchRepository && call.sessionId) {
      const item = await this.batchRepository.findItemBySessionId(call.sessionId);
      if (item && item.status === 'dialing') {
        await this.batchRepository.markItem(item.id, 'in_progress', { callId: call.id });
      }
    }
  }

  async handleEndOfCall(payload: EndOfCallPayload): Promise<void> {
    const sessionId = payload.session?.id;
    if (!sessionId) {
      return;
    }

    const call = await this.callRepository.findBySessionId(sessionId);
    if (!call) {
      return;
    }

    call.fonemaCallId = payload.id ?? call.fonemaCallId;
    call.status = 'completed';
    call.recordingUrl = payload.recordingURL ?? call.recordingUrl;
    call.detailsUrl = payload.detailsURL ?? call.detailsUrl;
    call.transcript = payload.messages ?? call.transcript;
    call.endedReason = payload.endedReason ?? call.endedReason;
    call.startedAt = payload.startedAt ?? call.startedAt;
    call.durationSeconds = payload.durationSeconds ?? call.durationSeconds;
    if (payload.variableValues) {
      call.outputVariables = { ...call.outputVariables, ...payload.variableValues };
    }
    call.summary = payload.analysis?.summary ?? call.summary;
    call.successEvaluation = payload.analysis?.successEvaluation ?? call.successEvaluation;
    call.structuredData = payload.analysis?.structuredData ?? call.structuredData;
    call.updatedAt = new Date().toISOString();

    await this.callRepository.save(call);
    await this.syncBatchItem(call, 'completed');
    await this.advancePipelineIfQualified(call);
  }

  private async advancePipelineIfQualified(call: Call): Promise<void> {
    if (!this.pipeline) return;
    if (!isCallQualified(call)) return;

    try {
      const caseId = await this.resolveCaseId(call);
      if (!caseId) return;
      await this.pipeline.advance(caseId, 'power_apps');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      console.warn(`sales-calls: auto-avance a power_apps omitido (llamada ${call.id}) — ${message}`);
    }
  }

  private async resolveCaseId(call: Call): Promise<string | undefined> {
    if (call.caseId) return call.caseId;

    const nit = call.variables?.nit?.trim();
    if (!nit || !this.pipelineCases) return undefined;

    const pipelineCase = await this.pipelineCases.ensureByLeadId(nit);
    return pipelineCase.id;
  }

  async handleEndOfSession(payload: EndOfSessionPayload): Promise<void> {
    const phoneNumber = payload.customer?.phoneNumber;
    if (!phoneNumber) {
      return;
    }

    const call = await this.callRepository.findLatestByPhoneNumber(phoneNumber);
    if (!call) {
      return;
    }

    if (payload.variableValues) {
      call.outputVariables = { ...call.outputVariables, ...payload.variableValues };
    }
    call.totalAttempts = payload.totalAttempts ?? call.totalAttempts;
    call.endedReason = payload.endedReason ?? call.endedReason;
    call.successEvaluation = payload.analysis?.successEvaluation ?? call.successEvaluation;
    call.structuredData = payload.analysis?.structuredData ?? call.structuredData;
    call.updatedAt = new Date().toISOString();

    await this.callRepository.save(call);
  }

  private async syncBatchItem(call: Call, terminal: 'completed' | 'failed'): Promise<void> {
    if (!this.batchRepository) return;

    const item = call.sessionId
      ? await this.batchRepository.findItemBySessionId(call.sessionId)
      : await this.batchRepository.findItemByCallId(call.id);
    if (!item) return;

    const status = call.status === 'failed' ? 'failed' : terminal;
    await this.batchRepository.markItem(item.id, status, {
      callId: call.id,
      qualified: isCallQualified(call),
      endedAt: new Date().toISOString(),
    });
  }

  private mapStatus(status?: string): CallStatus {
    switch (status) {
      case 'initiated':
        return 'initiated';
      case 'in-progress':
        return 'in_progress';
      default:
        return 'initiated';
    }
  }
}
