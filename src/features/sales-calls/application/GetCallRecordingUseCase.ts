import type { CallRepository } from '../domain/CallRepository.js';
import type { FonemaGateway, FonemaRecording } from '../domain/FonemaGateway.js';

/**
 * Resuelve los gateways Fonema (cuenta + API key) a intentar para descargar la
 * grabación de una llamada, en orden de preferencia según su agente. Las
 * llamadas de ventas y de seguimiento viven en cuentas Fonema distintas y la
 * grabación solo se descarga con la API key de su cuenta.
 */
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
    // Intenta la cuenta del agente primero; si falla (p. ej. una llamada sin
    // correlación perfecta), prueba la otra cuenta como respaldo.
    for (const gateway of this.gateways.gatewaysFor(call.agentId)) {
      const recording = await gateway.fetchRecording(call.recordingUrl);
      if (recording) {
        return recording;
      }
    }
    return null;
  }
}
