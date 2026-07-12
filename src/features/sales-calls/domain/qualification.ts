import type { Call } from './Call.js';

function asTriState(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === 'si' || v === 'sí' || v === 'yes' || v === '1' || v === 'verdadero') {
      return true;
    }
    if (v === 'false' || v === 'no' || v === '0' || v === 'falso') {
      return false;
    }
  }
  return undefined;
}

export function isCallQualified(call: Call): boolean {
  if (call.status !== 'completed') return false;

  const data = call.structuredData ?? {};
  const identidad = asTriState(data.identidad_verificada ?? data.identidadVerificada);
  const interesado = asTriState(data.cliente_interesado ?? data.clienteInteresado);
  if (identidad === true && interesado === true) return true;

  const success = asTriState(call.successEvaluation) === true;
  return success && identidad !== false && interesado !== false;
}
