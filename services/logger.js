const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.colorize({ all: true })
        }),
        new winston.transports.File({ filename: 'conversations.log' })
    ]
});

module.exports = logger;