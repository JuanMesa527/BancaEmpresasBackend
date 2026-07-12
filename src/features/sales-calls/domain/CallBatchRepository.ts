import type {
  BatchCounts,
  BatchItemStatus,
  BatchStatus,
  CallBatch,
  CallBatchItem,
  NewCallBatch,
} from './CallBatch.js';

export interface BatchItemPatch {
  callId?: string;
  sessionId?: string;
  qualified?: boolean;
  lastError?: string;
  startedAt?: string;
  endedAt?: string;
  incrementAttempts?: boolean;
}

export interface CallBatchRepository {
  createBatch(data: NewCallBatch): Promise<CallBatch>;

  findBatchById(id: string): Promise<CallBatch | null>;
  listBatches(): Promise<CallBatch[]>;
  updateBatchStatus(id: string, status: BatchStatus): Promise<void>;

  findRunningBatches(): Promise<CallBatch[]>;

  listItems(batchId: string): Promise<CallBatchItem[]>;
  countByStatus(batchId: string): Promise<BatchCounts>;

  countActive(batchId: string): Promise<number>;
  countStartedSince(batchId: string, since: Date): Promise<number>;
  countByStatuses(batchId: string, statuses: BatchItemStatus[]): Promise<number>;

  claimQueued(batchId: string, limit: number): Promise<CallBatchItem[]>;

  findItemById(id: string): Promise<CallBatchItem | null>;
  findItemByCallId(callId: string): Promise<CallBatchItem | null>;
  findItemBySessionId(sessionId: string): Promise<CallBatchItem | null>;

  markItem(itemId: string, status: BatchItemStatus, patch?: BatchItemPatch): Promise<void>;
}
