import type { Call } from './Call.js';

/**
 * Interpreta un valor como booleano de TRES estados: `true`, `false` o
 * `undefined` (desconocido). Distinguir "no reportado" de "reportado como falso"
 * es esencial para el fallback de calificación: si el agente marca la llamada
 * como exitosa pero no puebla las banderas estructuradas, no debemos tratar esa
 * ausencia como una negativa explícita.
 */
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

/**
 * Una llamada está CALIFICADA para el handoff a power-apps cuando el análisis de
 * Fonema indica identidad verificada + cliente interesado. Se acepta tanto el
 * `successEvaluation` global como banderas en `structuredData` (según cómo el
 * agente configure la extracción en el dashboard).
 */
export function isCallQualified(call: Call): boolean {
  if (call.status !== 'completed') return false;

  const data = call.structuredData ?? {};
  const identidad = asTriState(data.identidad_verificada ?? data.identidadVerificada);
  const interesado = asTriState(data.cliente_interesado ?? data.clienteInteresado);
  if (identidad === true && interesado === true) return true;

  // Fallback: el agente marcó éxito global (successEvaluation) y no hay señales
  // negativas EXPLÍCITAS. Que una bandera no venga (undefined) no bloquea: solo
  // un `false` explícito descalifica. Sin tri-estado este camino sería inalcanzable.
  const success = asTriState(call.successEvaluation) === true;
  return success && identidad !== false && interesado !== false;
}
