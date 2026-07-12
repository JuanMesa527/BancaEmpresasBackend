import type { FollowUpCase, FollowUpCaseView, FollowUpFase } from './entities.js';


export const DIA_PRIMER_RECORDATORIO = 30;
export const DIA_INICIO_MES_2 = 60;
export const DIA_RIESGO_INACTIVACION = 75;
export const DIA_INACTIVACION = 90;
const INTERVALO_MES_2 = 15;
const INTERVALO_MES_3 = 7;

export function diasSinUso(caso: FollowUpCase, now: Date, dayMs: number): number {
  const elapsed = now.getTime() - new Date(caso.lastUsedAt).getTime();
  const dias = Math.floor(Math.max(0, elapsed) / dayMs);
  return Math.min(DIA_INACTIVACION, dias);
}

export function faseDe(dias: number): FollowUpFase {
  if (dias < DIA_PRIMER_RECORDATORIO) return 'al_dia';
  if (dias < DIA_INICIO_MES_2) return 'mes_1';
  if (dias < DIA_INACTIVACION) return 'mes_2';
  return 'mes_3';
}

function recordatorioDelCiclo(caso: FollowUpCase): Date | null {
  if (!caso.lastReminderAt) return null;
  const reminder = new Date(caso.lastReminderAt);
  return reminder.getTime() > new Date(caso.lastUsedAt).getTime() ? reminder : null;
}

export function isReminderDue(caso: FollowUpCase, now: Date, dayMs: number): boolean {
  const dias = diasSinUso(caso, now, dayMs);
  if (dias < DIA_PRIMER_RECORDATORIO) return false;

  const ultimoRecordatorio = recordatorioDelCiclo(caso);
  if (!ultimoRecordatorio) return true; // primera llamada del ciclo (día 30)

  const diasDesdeRecordatorio = Math.floor((now.getTime() - ultimoRecordatorio.getTime()) / dayMs);
  if (dias >= DIA_INACTIVACION) return diasDesdeRecordatorio >= INTERVALO_MES_3;
  if (dias >= DIA_INICIO_MES_2) return diasDesdeRecordatorio >= INTERVALO_MES_2;
  return false; // mes 1: una sola llamada por ciclo
}

function proximaLlamadaEstimada(caso: FollowUpCase, now: Date, dayMs: number): string | null {
  const dias = diasSinUso(caso, now, dayMs);
  const desde = (base: string | Date, diasSuma: number): string =>
    new Date(new Date(base).getTime() + diasSuma * dayMs).toISOString();

  const ultimoRecordatorio = recordatorioDelCiclo(caso);
  if (!ultimoRecordatorio) return desde(caso.lastUsedAt, DIA_PRIMER_RECORDATORIO);
  if (dias >= DIA_INACTIVACION) return desde(ultimoRecordatorio, INTERVALO_MES_3);
  if (dias >= DIA_INICIO_MES_2) return desde(ultimoRecordatorio, INTERVALO_MES_2);
  return desde(caso.lastUsedAt, DIA_INICIO_MES_2);
}

export function buildFollowUpView(caso: FollowUpCase, now: Date, dayMs: number): FollowUpCaseView {
  const dias = diasSinUso(caso, now, dayMs);
  return {
    ...caso,
    diasSinUso: dias,
    fase: faseDe(dias),
    riesgoInactivacion: dias >= DIA_RIESGO_INACTIVACION && dias < DIA_INACTIVACION,
    diasParaInactivacion: Math.max(0, DIA_INACTIVACION - dias),
    proximaLlamadaEstimada: proximaLlamadaEstimada(caso, now, dayMs),
  };
}

export function toE164Colombia(telefono: string): string | null {
  const limpio = telefono.replace(/[\s()-]/g, '');
  if (/^\+\d{8,15}$/.test(limpio)) return limpio;
  const digitos = limpio.replace(/\D/g, '');
  if (digitos.length === 10) return `+57${digitos}`;
  if (digitos.length === 12 && digitos.startsWith('57')) return `+${digitos}`;
  return null;
}
