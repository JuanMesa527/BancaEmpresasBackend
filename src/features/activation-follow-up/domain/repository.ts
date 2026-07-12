import type { FollowUpCase } from './entities.js';

export interface CreateFollowUpCaseInput {
  clienteId: string;
  caseId?: string | null;
  clienteNombre?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

export interface FollowUpCaseRepository {
  findAll(): Promise<FollowUpCase[]>;
  findByClienteId(clienteId: string): Promise<FollowUpCase | null>;
  create(input: CreateFollowUpCaseInput): Promise<FollowUpCase>;
  setCongratulation(clienteId: string, callId: string | null): Promise<void>;
  registerUsage(clienteId: string, usedAt: Date): Promise<FollowUpCase | null>;
  registerReminder(clienteId: string, at: Date): Promise<void>;
}
