export interface ScheduleShipmentInput {
  caseId: string;
  companyId: string;
  cardHolderName: string;
}

export interface ShipmentScheduler {
  scheduleShipment(input: ScheduleShipmentInput): Promise<void>;
}
