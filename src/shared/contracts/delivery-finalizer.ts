/** Datos mínimos para cerrar la entrega y arrancar el seguimiento de la TC. */
export interface FinalizeDeliveryFollowUpInput {
  /** Identificación (NIT) de la empresa; llave del caso de seguimiento. */
  clienteId: string;
  nombre?: string;
  telefono?: string;
  correo?: string;
}

/**
 * Contrato para que delivery-confirmation dispare el cierre de entrega
 * (crear caso de seguimiento + avanzar el pipeline a activation_follow_up +
 * llamada de felicitación) sin importar internals de activation-follow-up.
 * Esa feature lo implementa. Idempotente por `clienteId`.
 */
export interface DeliveryFollowUpFinalizer {
  finalize(input: FinalizeDeliveryFollowUpInput): Promise<void>;
}
