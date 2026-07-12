
import type { TipoIdentificacionTarjetahabiente } from './power-app-request.js';

export function normalizeIdentification(value: string): string {
  return value.replace(/[.\-\s]/g, '').trim();
}

export function looksLikeEmpresaNit(value: string): boolean {
  const id = normalizeIdentification(value);
  return /^\d{9,10}$/.test(id);
}

function isNitPattern(id: string): boolean {
  return id.length >= 9 && /^\d{9,10}$/.test(id);
}

export function looksLikeTarjetahabienteDocument(
  value: string,
  tipo: TipoIdentificacionTarjetahabiente = 'CC',
): boolean {
  const id = normalizeIdentification(value).toUpperCase();
  if (!id) return false;

  switch (tipo) {
    case 'CC':
      return /^\d{6,11}$/.test(id) && !isNitPattern(id);
    case 'TI':
      return /^\d{6,11}$/.test(id) && !isNitPattern(id);
    case 'CE':
      return /^\d{6,15}$/.test(id);
    case 'PA':
      return /^[A-Z0-9]{5,20}$/.test(id);
    default:
      return looksLikeNaturalPersonDocument(value);
  }
}

export function looksLikeNaturalPersonDocument(value: string): boolean {
  const id = normalizeIdentification(value).toUpperCase();
  if (/^[A-Z0-9]{5,20}$/.test(id) && /[A-Z]/.test(id)) return true;
  if (!/^\d{6,15}$/.test(id)) return false;
  if (isNitPattern(id)) return false;
  return true;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidColombianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return /^(57)?3\d{9}$/.test(digits) || /^3\d{9}$/.test(digits);
}
