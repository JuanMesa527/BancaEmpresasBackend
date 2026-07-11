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
  /** Contacto del lead (NIT) para la felicitación al cerrar la entrega. */
  leadContacts: LeadContactDirectory;
  /** Cierre de entrega: crea el caso de seguimiento, avanza el pipeline y felicita. */
  finalizer: DeliveryFollowUpFinalizer;
  /** Milisegundos que representan 1 día emulado (para el reintento). */
  dayMs: number;
}

export interface ConfirmDeliveryResult {
  status: 'confirmed' | 'retry_scheduled';
  nextEmailAt?: string;
}

/**
 * Procesa la respuesta del gerente:
 * - delivered_to_holder → caso confirmado y CIERRE DE ENTREGA automático: avanza
 *   el pipeline a activation_follow_up y dispara la llamada de seguimiento
 *   (felicitación) reusando el finalizer de activation-follow-up (idempotente por
 *   cliente). Best-effort: un fallo del cierre no invalida la confirmación ya
 *   registrada.
 * - cualquier otro outcome → se reprograma el correo a +1 día emulado.
 */
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

  // Cierre de entrega automático: el finalizer avanza el pipeline a
  // activation_follow_up y dispara la felicitación. Best-effort — la entrega ya
  // quedó confirmada; un fallo aquí no debe romper la respuesta al gerente.
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
