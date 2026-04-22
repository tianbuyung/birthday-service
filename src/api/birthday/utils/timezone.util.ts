import { DateTime } from 'luxon';

/**
 * Computes the next occurrence of the user's birthday at 09:00 in their
 * local timezone. If the birthday has already passed this year (including
 * if today is their birthday but it is already past 9 AM), returns 9 AM
 * on their next birthday.
 *
 * Luxon gracefully handles leap-day birthdays (Feb 29) on non-leap years
 * by landing on Feb 28.
 */
export function computeNextBirthday9AM(birthday: Date, timezone: string): Date {
  const now = DateTime.now().setZone(timezone);
  const bday = DateTime.fromJSDate(birthday, { zone: 'utc' }).setZone(timezone);

  let candidate = now.set({
    month: bday.month,
    day: bday.day,
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  if (candidate <= now) {
    candidate = candidate.plus({ years: 1 });
  }

  return candidate.toJSDate();
}
