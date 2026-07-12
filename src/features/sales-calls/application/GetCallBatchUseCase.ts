import type { BatchCounts, CallBatch } from '../domain/CallBatch.js';
import type { CallBatchRepository } from '../domain/CallBatchRepository.js';

export interface CallBatchProgress {
  batch: CallBatch;
  counts: BatchCounts;
  progress: number;
}

export class GetCallBatchUseCase {
  constructor(private readonly batchRepository: CallBatchRepository) {}

  async execute(batchId: string): Promise<CallBatchProgress | null> {
    const batch = await this.batchRepository.findBatchById(batchId);
    if (!batch) return null;

    const counts = await this.batchRepository.countByStatus(batchId);
    const finished = counts.completed + counts.failed + counts.skipped;
    const progress = counts.total > 0 ? finished / counts.total : 0;

    return { batch, counts, progress };
  }
}
