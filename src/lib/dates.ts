// Local-date helpers. All "days" in the app are local calendar days
// (yyyy-mm-dd), never UTC, so early-morning users see the right day.

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDaysISO(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(a: string, b: string): number {
  const ms = fromISO(b).getTime() - fromISO(a).getTime();
  return Math.round(ms / 86400000);
}

export function weekdayOf(iso: string): number {
  return fromISO(iso).getDay(); // 0 = Sunday
}

/** Monday-based week start. */
export function weekStartISO(iso: string): string {
  const wd = weekdayOf(iso);
  return addDaysISO(iso, wd === 0 ? -6 : 1 - wd);
}

export function weekDates(mondayISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysISO(mondayISO, i));
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthDates(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => toISO(new Date(year, month, i + 1)));
}

export function rangeDates(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  let cur = startISO;
  while (daysBetween(cur, endISO) >= 0) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return out;
}

export function lastNDates(n: number, endISO = todayISO()): string[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(endISO, -(n - 1 - i)));
}

export function fmtShort(iso: string): string {
  return fromISO(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fmtLong(iso: string): string {
  return fromISO(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function relativeDay(iso: string): string {
  const diff = daysBetween(todayISO(), iso);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return fmtShort(iso);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
