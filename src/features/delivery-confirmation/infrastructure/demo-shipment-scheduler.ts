import { randomUUID } from 'node:crypto';
import type {
  ScheduleShipmentInput,
  ShipmentScheduler,
} from '../../../shared/contracts/shipment-scheduler.js';
import { processDueEmails, type ProcessDueEmailsDeps } from '../application/process-due-emails.js';

export class DemoShipmentScheduler implements ShipmentScheduler {
  constructor(private readonly resolveDeps: () => ProcessDueEmailsDeps) {}

  async scheduleShipment(input: ScheduleShipmentInput): Promise<void> {
    const deps = this.resolveDeps();

    const existing = await deps.repository.findByCaseId(input.caseId);
    if (existing) {
      if (existing.status !== 'scheduled' && existing.status !== 'retry_scheduled') {
        await deps.repository.scheduleRetry(existing.id, 'not_arrived', new Date());
      }
      const processed = await processDueEmails(deps, { pipelineCaseId: input.caseId });
      if (processed === 0) {
        console.warn(
          `delivery-confirmation: re-submit for pipeline case ${input.caseId} did not dispatch email`,
        );
      }
      return;
    }

    const now = new Date().toISOString();
    await deps.repository.create({
      caseId: input.caseId,
      cardId: randomUUID(),
      companyId: input.companyId,
      cardHolderName: input.cardHolderName,
      cardLastFour: String(Math.floor(1000 + Math.random() * 9000)),
      physicalShippedAt: now,
      emailScheduledAt: now,
    });

    const processed = await processDueEmails(deps, { pipelineCaseId: input.caseId });
    if (processed === 0) {
      console.warn(
        `delivery-confirmation: new shipment for pipeline case ${input.caseId} did not dispatch email`,
      );
    }
  }
}
