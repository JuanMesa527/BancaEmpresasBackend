export const TIPO_TARJETA_LATAM_BUSINESS = 'LATAM BUSINESS';

export const TIPOS_TARJETA_ACEPTADOS = new Set([
  'LATAM BUSINESS',
  'LATAM BUSINESS VISA',
  'TC_LATAM_BUSINESS',
  'TC LATAM BUSINESS',
]);

export const BINES_LATAM_BUSINESS = new Set(['491250', '549166']);

export function isTipoTarjetaLatamBusiness(value: string): boolean {
  const normalized = value.trim().toUpperCase().replace(/_/g, ' ').replace(/\s+/g, ' ');
  return (
    TIPOS_TARJETA_ACEPTADOS.has(normalized) ||
    (normalized.includes('LATAM') && normalized.includes('BUSINESS'))
  );
}

export function isBinLatamBusiness(value: string): boolean {
  const bin = value.replace(/\D/g, '');
  return BINES_LATAM_BUSINESS.has(bin);
}
