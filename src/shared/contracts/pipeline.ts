export type PipelineStage =
  | 'file_matching'
  | 'sales_call'
  | 'power_apps'
  | 'delivery_confirmation'
  | 'activation_follow_up'
  | 'completed'
  | 'rejected'
  | 'failed';

export type HitlDecision = 'approve' | 'reject' | 'retry';

export const PIPELINE_ORDER: readonly PipelineStage[] = [
  'file_matching',
  'sales_call',
  'power_apps',
  'delivery_confirmation',
  'activation_follow_up',
  'completed',
] as const;

export interface PipelineLeadRef {
  leadId: string;
  matchKey: string;
}

export interface PipelineCase {
  id: string;
  stage: PipelineStage;
  lead: PipelineLeadRef;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface PipelineStageAdvancer {
  advance(caseId: string, toStage: PipelineStage): Promise<void>;
}
