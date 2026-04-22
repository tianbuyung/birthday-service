import { DateTime } from 'luxon';

import { computeNextBirthday9AM } from './timezone.util';

// Birthday used across all tests: April 25 at midnight UTC
const BIRTHDAY = new Date('1990-04-25T00:00:00Z');

// Returns the expected fire time: 9 AM on a given date in the given timezone
const at9AM = (year: number, tz: string, month = 4, day = 25): Date => {
  return DateTime.fromObject(
    { year, month, day, hour: 9 },
    { zone: tz },
  ).toJSDate();
};

const mockNow = (utcIso: string) => {
  jest
    .spyOn(DateTime, 'now')
    .mockReturnValue(
      DateTime.fromISO(utcIso, { zone: 'utc' }) as DateTime<true>,
    );
};

describe('computeNextBirthday9AM', () => {
  const TZ = 'Asia/Jakarta'; // UTC+7

  it('returns this year when birthday 9 AM is still in the future', () => {
    // April 20 10:00 AM Jakarta (03:00 UTC)
    mockNow('2025-04-20T03:00:00Z');

    expect(computeNextBirthday9AM(BIRTHDAY, TZ).getTime()).toBe(
      at9AM(2025, TZ).getTime(),
    );
  });

  it('returns next year when birthday already passed this year', () => {
    // April 26 10:00 AM Jakarta (03:00 UTC) — birthday was yesterday
    mockNow('2025-04-26T03:00:00Z');

    expect(computeNextBirthday9AM(BIRTHDAY, TZ).getTime()).toBe(
      at9AM(2026, TZ).getTime(),
    );
  });

  it('returns today at 9 AM when it is their birthday and before 9 AM', () => {
    // April 25 08:00 AM Jakarta (01:00 UTC)
    mockNow('2025-04-25T01:00:00Z');

    expect(computeNextBirthday9AM(BIRTHDAY, TZ).getTime()).toBe(
      at9AM(2025, TZ).getTime(),
    );
  });

  it('returns next year when it is their birthday but already past 9 AM', () => {
    // April 25 10:00 AM Jakarta (03:00 UTC)
    mockNow('2025-04-25T03:00:00Z');

    expect(computeNextBirthday9AM(BIRTHDAY, TZ).getTime()).toBe(
      at9AM(2026, TZ).getTime(),
    );
  });

  it('returns next year when it is exactly 9 AM on birthday (boundary)', () => {
    // April 25 09:00 AM Jakarta (02:00 UTC) — exactly at fire time
    mockNow('2025-04-25T02:00:00Z');

    expect(computeNextBirthday9AM(BIRTHDAY, TZ).getTime()).toBe(
      at9AM(2026, TZ).getTime(),
    );
  });

  it('always fires at 9 AM in the local timezone, not 9 AM UTC', () => {
    mockNow('2025-04-20T00:00:00Z'); // April 20 07:00 AM Jakarta

    const result = DateTime.fromJSDate(computeNextBirthday9AM(BIRTHDAY, TZ), {
      zone: TZ,
    });

    expect(result.hour).toBe(9);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
  });

  it('works correctly for a western timezone (America/New_York, UTC-4 in DST)', () => {
    const TZ_NY = 'America/New_York';
    // April 20 15:00 UTC = 11:00 AM New York
    mockNow('2025-04-20T15:00:00Z');
    // Use noon UTC so the day is unambiguously April 25 in all timezones
    const birthdayNoon = new Date('1990-04-25T12:00:00Z');

    const result = DateTime.fromJSDate(
      computeNextBirthday9AM(birthdayNoon, TZ_NY),
      {
        zone: TZ_NY,
      },
    );

    expect(result.year).toBe(2025);
    expect(result.month).toBe(4);
    expect(result.day).toBe(25);
    expect(result.hour).toBe(9);
  });

  it('handles Feb 29 birthdays — lands on a valid date in non-leap years', () => {
    // Jan 1 2025 — non-leap year
    mockNow('2025-01-01T00:00:00Z');
    const leapDayBirthday = new Date('1992-02-29T00:00:00Z');

    const result = DateTime.fromJSDate(
      computeNextBirthday9AM(leapDayBirthday, 'UTC'),
      {
        zone: 'UTC',
      },
    );

    expect(result.year).toBe(2025);
    expect(result.hour).toBe(9);
    expect(result.isValid).toBe(true);
  });
});
