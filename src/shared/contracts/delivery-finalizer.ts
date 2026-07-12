export interface FinalizeDeliveryFollowUpInput {
  clienteId: string;
  nombre?: string;
  telefono?: string;
  correo?: string;
}

export interface DeliveryFollowUpFinalizer {
  finalize(input: FinalizeDeliveryFollowUpInput): Promise<void>;
}
