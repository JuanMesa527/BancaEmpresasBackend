import type { PacingPolicy } from './CallBatch.js';

function localHour(date: Date, timezone: string): number {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).format(date);
  const hour = Number.parseInt(formatted, 10);
  return Number.isNaN(hour) ? 0 : hour % 24;
}

export function isWithinContactWindow(pacing: PacingPolicy, now: Date): boolean {
  if (pacing.earliestAt && now < new Date(pacing.earliestAt)) return false;
  if (pacing.latestAt && now > new Date(pacing.latestAt)) return false;

  if (pacing.businessHours) {
    const hour = localHour(now, pacing.timezone);
    const { startHour, endHour } = pacing.businessHours;
    if (hour < startHour || hour >= endHour) return false;
  }

  return true;
}
