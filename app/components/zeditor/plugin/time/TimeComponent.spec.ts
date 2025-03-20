import dayjs from 'dayjs';
import { describe, expect, test } from 'vitest';
import { getReadableTime } from './TimeComponent';

describe('getReadableTime', () => {
  const now = dayjs();
  const todayStr = now.format('YYYY/MM/DD');
  const yesterdayStr = now.clone().subtract(1, 'day').format('YYYY/MM/DD');
  const tomorrowStr = now.clone().add(1, 'day').format('YYYY/MM/DD');
  const lastWeekDay = now.clone().subtract(3, 'days'); // e.g., 3 days ago
  const nextWeekDay = now.clone().add(3, 'days');   // e.g., 3 days ahead
  const farFutureStr = now.clone().add(1, 'year').format('YYYY/MM/DD');

  // 'date' format tests
  test('returns "Today" when date is today', () => {
    expect(getReadableTime('date', `${todayStr} 00:00:00`, '')).toBe('Today');
  });

  test('returns "Yesterday" when date is yesterday', () => {
    expect(getReadableTime('date', `${yesterdayStr} 00:00:00`, '')).toBe('Yesterday');
  });

  test('returns "Tomorrow" when date is tomorrow', () => {
    expect(getReadableTime('date', `${tomorrowStr} 00:00:00`, '')).toBe('Tomorrow');
  });

  test('returns "Last [Day]" when date is within last week', () => {
    const lastDayStr = lastWeekDay.format('YYYY/MM/DD');
    const dayName = lastWeekDay.format('dddd');
    expect(getReadableTime('date', `${lastDayStr} 00:00:00`, '')).toBe(`Last ${dayName}`);
  });

  test('returns "Next [Day]" when date is within next week', () => {
    const nextDayStr = nextWeekDay.format('YYYY/MM/DD');
    const dayName = nextWeekDay.format('dddd');
    expect(getReadableTime('date', `${nextDayStr} 00:00:00`, '')).toBe(`Next ${dayName}`);
  });

  test('returns "YYYY/MM/DD" for a far future date', () => {
    expect(getReadableTime('date', `${farFutureStr} 00:00:00`, '')).toBe(farFutureStr);
  });

  test('returns "YYYY/MM/DD" for a specific date like 2025/2/12', () => {
    expect(getReadableTime('date', '2025/2/12 00:00:00', '')).toBe('2025/02/12');
  });

  // 'time' format test
  test('returns time in "h:mm a" format', () => {
    const timeInput = '2025-03-18T17:01:00.000Z';
    const expectedTime = dayjs(timeInput).format('h:mm a');
    expect(getReadableTime('time', '', timeInput)).toBe(expectedTime);
  });

  // 'both' format tests
  test('returns "Today at [time]" when date is today', () => {
    const timeInput = '2025-03-18T17:01:00.000Z';
    const expectedTime = dayjs(timeInput).format('h:mm a'); // Convert to local time for Toda
    expect(getReadableTime('both', `${todayStr} 00:00:00`, timeInput)).toBe(`Today @${expectedTime}`);
  });

  test('returns "Yesterday at [time]" when date is yesterday', () => {
    const timeInput = '2025-03-18T17:01:00.000Z';
    const expectedTime = dayjs(timeInput).format('h:mm a');
    expect(getReadableTime('both', `${yesterdayStr} 00:00:00`, timeInput)).toBe(`Yesterday @${expectedTime}`);
  });

  test('returns "YYYY/MM/DD at [time]" for a far future date', () => {
    const timeInput = '2025-03-18T17:01:00.000Z';
    const expectedTime = dayjs(timeInput).format('h:mm a');
    expect(getReadableTime('both', '2025/2/12 00:00:00', timeInput)).toBe(`2025/02/12 @${expectedTime}`);
  });
});