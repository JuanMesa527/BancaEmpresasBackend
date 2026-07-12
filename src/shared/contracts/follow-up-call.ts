export type FollowUpCallTipo = 'felicitacion' | 'recordatorio_uso';

export interface FollowUpCallInput {
  tipo: FollowUpCallTipo;
  phoneNumber: string;
  customerName?: string;
  nit: string;
  caseId?: string;
  variables?: Record<string, string>;
}

export interface FollowUpCallResult {
  callId: string;
}

export interface FollowUpCallService {
  initiate(input: FollowUpCallInput): Promise<FollowUpCallResult>;
}
