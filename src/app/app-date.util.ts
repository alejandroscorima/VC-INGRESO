import { environment } from '../environments/environment';

/**
 * Fecha local "hoy" en la zona del condominio (alinear con PHP/MySQL).
 * Ver `environment.appTimeZone` (por defecto America/Lima).
 */
export function todayYmdInAppTimeZone(): string {
  const tz = environment.appTimeZone ?? 'America/Lima';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/** Interpreta YYYY-MM-DD como fecha civil (sin UTC). */
export function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((n) => Number(n));
  return new Date(y, m - 1, d);
}

export function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysYmd(ymd: string, delta: number): string {
  const d = parseYmdLocal(ymd);
  d.setDate(d.getDate() + delta);
  return formatYmdLocal(d);
}

/** Lunes de la semana que contiene `ymd` (Lun–Dom). */
export function mondayOfWeekYmd(ymd: string): string {
  const d = parseYmdLocal(ymd);
  const dow = d.getDay();
  const toMon = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + toMon);
  return formatYmdLocal(d);
}
