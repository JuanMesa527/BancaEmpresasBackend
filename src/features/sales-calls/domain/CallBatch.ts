export type BatchStatus = 'running' | 'paused' | 'completed' | 'cancelled';

export type BatchItemStatus =
  | 'queued'
  | 'dialing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface BusinessHours {
  startHour: number;
  endHour: number;
}

export interface PacingPolicy {
  maxConcurrent: number;
  perHour: number;
  earliestAt?: string;
  latestAt?: string;
  businessHours?: BusinessHours;
  timezone: string;
}

export interface CallBatch {
  id: string;
  name: string;
  agentId: string;
  status: BatchStatus;
  pacing: PacingPolicy;
  defaultVariables: Record<string, string>;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CallBatchItem {
  id: string;
  batchId: string;
  leadId: string;
  caseId?: string;
  phoneNumber: string;
  customerName?: string;
  customerEmail?: string;
  variables: Record<string, string>;
  status: BatchItemStatus;
  callId?: string;
  sessionId?: string;
  qualified?: boolean;
  attempts: number;
  lastError?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewBatchLead {
  leadId: string;
  caseId?: string;
  phoneNumber: string;
  customerName?: string;
  customerEmail?: string;
  variables?: Record<string, string>;
}

export interface NewCallBatch {
  name: string;
  agentId: string;
  pacing: PacingPolicy;
  defaultVariables: Record<string, string>;
  leads: NewBatchLead[];
}

export interface BatchCounts {
  queued: number;
  dialing: number;
  in_progress: number;
  completed: number;
  failed: number;
  skipped: number;
  total: number;
}
