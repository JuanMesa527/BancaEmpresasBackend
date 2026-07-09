/** Utilidades para distinguir NIT empresarial vs documento de persona natural (Colombia). */

export function normalizeIdentification(value: string): string {
  return value.replace(/[.\-\s]/g, '').trim();
}

/**
 * NIT de persona jurídica: típicamente 9 dígitos (o 10 con DV).
 * La mayoría de NIT empresariales inician en 8 o 9.
 */
export function looksLikeEmpresaNit(value: string): boolean {
  const id = normalizeIdentification(value);
  if (!/^\d{9,11}$/.test(id)) return false;

  const base = id.length >= 10 ? id.slice(0, 9) : id;
  return /^[89]\d{8}$/.test(base) || id.length === 9;
}

/**
 * Cédula u otro documento PN: 6–10 dígitos, sin patrón típico de NIT empresarial.
 */
export function looksLikeNaturalPersonDocument(value: string): boolean {
  const id = normalizeIdentification(value);
  if (!/^\d{6,10}$/.test(id)) return false;
  if (id.length >= 9 && /^[89]\d{8,9}$/.test(id)) return false;
  return true;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidColombianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return /^(57)?3\d{9}$/.test(digits) || /^3\d{9}$/.test(digits);
}
