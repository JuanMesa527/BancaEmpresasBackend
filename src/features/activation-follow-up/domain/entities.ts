export type FollowUpFase = 'al_dia' | 'mes_1' | 'mes_2' | 'mes_3';

export interface FollowUpCase {
  id: string;
  clienteId: string;
  caseId: string | null;
  clienteNombre: string | null;
  telefono: string | null;
  correo: string | null;
  deliveredAt: string;
  congratulatedAt: string | null;
  congratulationCallId: string | null;
  lastUsedAt: string;
  lastReminderAt: string | null;
  reminderCount: number;
}

export interface FollowUpCaseView extends FollowUpCase {
  diasSinUso: number;
  fase: FollowUpFase;
  riesgoInactivacion: boolean;
  diasParaInactivacion: number;
  proximaLlamadaEstimada: string | null;
}

export interface FollowUpRemindersResumen {
  procesados: number;
  llamadasIniciadas: number;
  errores: number;
}
