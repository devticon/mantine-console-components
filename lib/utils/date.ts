import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/pl';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.locale('pl');
dayjs.extend(localizedFormat);

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
