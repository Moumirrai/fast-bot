import { createLogger, format, transports } from 'winston';

const WinstonLogger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
          (info) => `${info.timestamp} [${info.level.toLocaleUpperCase()}]: ${info.message}`
        )
      )
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
          (info) => `${info.timestamp} [${info.level.toLocaleUpperCase()}]: ${info.message}`
        )
      )
    })
  ],
  exitOnError: false,
  format: format.printf((info) => {
    const { level, message } = info;
    const now = new Date().toLocaleString();
    return `[4803]: [${level.toUpperCase()}] ${message} (${now})`;
  })
});

export default WinstonLogger;
