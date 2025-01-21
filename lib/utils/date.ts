/* eslint-disable import/no-duplicates */
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/pl';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/plugin/localizedFormat';
import 'dayjs/plugin/timezone';

dayjs.locale('pl');
dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
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
