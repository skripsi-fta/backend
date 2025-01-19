import type { Dayjs } from 'dayjs';
import { ScheduleDayNumber } from 'src/database/entities/fixedschedule.entity';

export const findDateInSameWeek = (date: Dayjs, dayName: string) => {
  const targetDay = ScheduleDayNumber[dayName];

  const currentDay = date.day();

  const daysUntilTarget =
    targetDay >= currentDay
      ? targetDay - currentDay
      : 7 - (currentDay - targetDay);

  return date.add(daysUntilTarget, 'day');
};
