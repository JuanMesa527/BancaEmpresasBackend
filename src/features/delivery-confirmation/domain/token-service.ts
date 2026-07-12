export interface ConfirmationTokenService {
  generate(deliveryCaseId: string, managerEmail: string): string;
  hash(token: string): string;
  verify(token: string): { deliveryCaseId: string; managerEmail: string } | null;
}
