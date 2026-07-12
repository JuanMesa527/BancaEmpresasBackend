import type {
  CompanyManager,
  DeliveryConfirmationCase,
  DeliveryConfirmationOutcome,
  DeliveryEmailAttempt,
  NewDeliveryConfirmationCase,
} from './types.js';

export interface DeliveryConfirmationRepository {
  create(data: NewDeliveryConfirmationCase): Promise<DeliveryConfirmationCase>;
  findById(id: string): Promise<DeliveryConfirmationCase | null>;
  findByCaseId(caseId: string): Promise<DeliveryConfirmationCase | null>;
  findDue(now: Date): Promise<DeliveryConfirmationCase[]>;
  markSent(id: string, sentAt: Date): Promise<void>;
  confirm(id: string, outcome: DeliveryConfirmationOutcome, confirmedAt: Date): Promise<void>;
  scheduleRetry(
    id: string,
    outcome: DeliveryConfirmationOutcome,
    nextEmailAt: Date,
  ): Promise<void>;
  recordEmailAttempt(attempt: DeliveryEmailAttempt): Promise<void>;
  findEmailAttemptByTokenHash(
    tokenHash: string,
  ): Promise<{ deliveryCaseId: string; managerEmail: string; status: string } | null>;
  markTokenUsed(tokenHash: string): Promise<void>;
}

export interface ManagerDirectory {
  findByCompanyId(companyId: string): Promise<CompanyManager[]>;
}

export interface LeadContact {
  nombre: string | null;
  telefono: string | null;
  correo: string | null;
}

export interface LeadContactDirectory {
  findByCompanyId(companyId: string): Promise<LeadContact | null>;
}
