import type { DeliveryConfirmationRepository, LeadContactDirectory } from '../domain/repository.js';
import type { ConfirmationTokenService } from '../domain/token-service.js';
import type { DeliveryConfirmationOutcome } from '../domain/types.js';
import { RETRY_OUTCOMES } from '../domain/types.js';
import type { DeliveryFollowUpFinalizer } from '../../../shared/contracts/delivery-finalizer.js';
import { AppError, NotFoundError, ValidationError } from '../../../shared/exceptions/app-error.js';

export interface ConfirmDeliveryInput {
  token: string;
  outcome: DeliveryConfirmationOutcome;
}

export interface ConfirmDeliveryDeps {
  repository: DeliveryConfirmationRepository;
  tokens: ConfirmationTokenService;
  leadContacts: LeadContactDirectory;
  finalizer: DeliveryFollowUpFinalizer;
  dayMs: number;
}

export interface ConfirmDeliveryResult {
  status: 'confirmed' | 'retry_scheduled';
  nextEmailAt?: string;
}

export async function confirmDelivery(
  input: ConfirmDeliveryInput,
  deps: ConfirmDeliveryDeps,
): Promise<ConfirmDeliveryResult> {
  const payload = deps.tokens.verify(input.token);
  if (!payload) {
    throw new AppError('Invalid or expired confirmation token', 401, 'INVALID_TOKEN');
  }

  const tokenHash = deps.tokens.hash(input.token);
  const attempt = await deps.repository.findEmailAttemptByTokenHash(tokenHash);
  if (!attempt || attempt.deliveryCaseId !== payload.deliveryCaseId) {
    throw new AppError('Invalid or expired confirmation token', 401, 'INVALID_TOKEN');
  }
  if (attempt.status === 'used') {
    throw new AppError('This confirmation link was already used', 409, 'TOKEN_ALREADY_USED');
  }

  const deliveryCase = await deps.repository.findById(payload.deliveryCaseId);
  if (!deliveryCase) {
    throw new NotFoundError('Delivery confirmation case not found');
  }
  if (deliveryCase.status === 'confirmed') {
    throw new ValidationError('This delivery was already confirmed');
  }
  if (deliveryCase.status !== 'awaiting_confirmation') {
    throw new ValidationError('This case is not awaiting confirmation');
  }

  await deps.repository.markTokenUsed(tokenHash);

  if (RETRY_OUTCOMES.includes(input.outcome)) {
    const nextEmailAt = new Date(Date.now() + deps.dayMs);
    await deps.repository.scheduleRetry(deliveryCase.id, input.outcome, nextEmailAt);
    return { status: 'retry_scheduled', nextEmailAt: nextEmailAt.toISOString() };
  }

  await deps.repository.confirm(deliveryCase.id, input.outcome, new Date());

  try {
    const contact = await deps.leadContacts.findByCompanyId(deliveryCase.companyId);
    await deps.finalizer.finalize({
      clienteId: deliveryCase.companyId,
      nombre: contact?.nombre ?? deliveryCase.cardHolderName,
      telefono: contact?.telefono ?? undefined,
      correo: contact?.correo ?? undefined,
    });
  } catch (error) {
    console.error(
      `delivery-confirmation: cierre de entrega automático falló (caso ${deliveryCase.caseId}) — ${error instanceof Error ? error.message : error}`,
    );
  }

  return { status: 'confirmed' };
}
