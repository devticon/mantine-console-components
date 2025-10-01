/* eslint-disable import/no-duplicates */
import dayjs from 'dayjs';
import 'dayjs/locale/en.js';
import 'dayjs/locale/pl.js';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/plugin/localizedFormat.js';
import 'dayjs/plugin/timezone.js';
import 'dayjs/plugin/utc.js';

dayjs.locale('pl');
dayjs.extend(utc);
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
