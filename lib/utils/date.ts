import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/pl';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('pl');
dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Warsaw');

export function formatDate(date: Date | number | string): string {
  return dayjs(date).format('L');
}

export function formatTime(date: Date | number | string): string {
  return dayjs(date).format('LTS');
}

export function formatDateTime(date: Date | number | string): string {
  return dayjs(date).format('L LTS');
}

export function parseDate(date: Date | string | null | undefined) {
  if (date) {
    return new Date(date);
  } else {
    return null;
  }
}

export { dayjs };
