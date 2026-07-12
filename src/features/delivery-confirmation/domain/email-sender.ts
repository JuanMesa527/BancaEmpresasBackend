export interface DeliveryEmailPayload {
  to: string;
  managerName: string;
  cardHolderName: string;
  cardLastFour: string;
  confirmationUrl: string;
  isRetry: boolean;
}

export interface DeliveryEmailSender {
  send(payload: DeliveryEmailPayload): Promise<string | undefined>;
}
