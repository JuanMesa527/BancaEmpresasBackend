import type { CallRepository } from '../domain/CallRepository.js';
import type { FonemaGateway, FonemaRecording } from '../domain/FonemaGateway.js';

export interface RecordingGatewayResolver {
  gatewaysFor(agentId: string): FonemaGateway[];
}

export class GetCallRecordingUseCase {
  constructor(
    private readonly callRepository: CallRepository,
    private readonly gateways: RecordingGatewayResolver,
  ) {}

  async execute(callId: string): Promise<FonemaRecording | null> {
    const call = await this.callRepository.findById(callId);
    if (!call?.recordingUrl) {
      return null;
    }
    for (const gateway of this.gateways.gatewaysFor(call.agentId)) {
      const recording = await gateway.fetchRecording(call.recordingUrl);
      if (recording) {
        return recording;
      }
    }
    return null;
  }
}
