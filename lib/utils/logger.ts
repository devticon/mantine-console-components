import { createLoggerMiddleware } from 'remix-utils/middleware/logger';
import { pino } from 'pino';

export const logger = pino({
  level: 'debug',
  formatters: { level: label => ({ level: label }) },
});

export const [loggerMiddleware] = createLoggerMiddleware({
  logger,
});
