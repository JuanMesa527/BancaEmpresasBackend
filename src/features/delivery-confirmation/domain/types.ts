/** Resultado de la confirmación del gerente sobre la entrega física. */
export type DeliveryConfirmationOutcome =
  | 'delivered_to_holder'
  | 'not_arrived'
  | 'holder_absent'
  | 'return_to_bank';

/** Outcomes que reprograman un nuevo correo (+1 día). */
export const RETRY_OUTCOMES: readonly DeliveryConfirmationOutcome[] = [
  'not_arrived',
  'holder_absent',
  'return_to_bank',
] as const;

export type DeliveryEmailStatus =
  | 'scheduled'
  | 'sent'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'retry_scheduled'
  | 'failed';

export interface DeliveryConfirmationCase {
  id: string;
  caseId: string;
  cardId: string;
  companyId: string;
  /** Emails de gerentes (pueden ser varios; salen de Supabase). */
  managerEmails: string[];
  status: DeliveryEmailStatus;
  outcome?: DeliveryConfirmationOutcome;
  /** Fecha/hora emulada o real del envío físico de la tarjeta. */
  physicalShippedAt: string;
  /** Cuándo debe enviarse (o reenviarse) el correo. */
  emailScheduledAt: string;
  sentAt?: string;
  confirmedAt?: string;
}
