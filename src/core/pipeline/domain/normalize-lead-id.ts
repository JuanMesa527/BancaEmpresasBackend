export function normalizeLeadId(leadId: string): string {
  const trimmed = leadId.trim();
  const digits = trimmed.replace(/\D/g, '');
  return digits || trimmed;
}
