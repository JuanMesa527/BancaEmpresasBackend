import type { FollowUpCallService } from '../../../shared/contracts/follow-up-call.js';
import { getActivationFollowUpDeps } from './composition.js';

const TICK_INTERVAL_MS = 5_000;

let timer: NodeJS.Timeout | null = null;

export function startActivationFollowUpScheduler(followUpCalls: FollowUpCallService): void {
  if (timer) return;

  let deps;
  try {
    deps = getActivationFollowUpDeps(followUpCalls);
  } catch (error) {
    console.warn(
      `activation-follow-up scheduler disabled: ${error instanceof Error ? error.message : error}`,
    );
    return;
  }

  timer = setInterval(async () => {
    try {
      const resumen = await deps.processReminders.execute();
      if (resumen.procesados > 0) {
        console.log(
          `activation-follow-up: ${resumen.llamadasIniciadas}/${resumen.procesados} recordatorio(s) iniciados (${resumen.errores} errores)`,
        );
      }
    } catch (error) {
      console.error('activation-follow-up scheduler tick failed', error);
    }
  }, TICK_INTERVAL_MS);

  console.log(`activation-follow-up scheduler started (tick=${TICK_INTERVAL_MS}ms)`);
}

export function stopActivationFollowUpScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
