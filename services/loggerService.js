const winston = require('winston');
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');

// Feature toggle for logging. Defaults to true.
const isLoggingEnabled = process.env.LOGGING_ENABLED !== 'false';

// Define different log formats
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const transports = [];

if (isLoggingEnabled) {
    // Log errors to a separate file
    transports.push(new winston.transports.File({
        filename: path.join(logDirectory, 'error.log'),
        level: 'error',
    }));
    // Log all levels to a combined file
    transports.push(new winston.transports.File({
        filename: path.join(logDirectory, 'combined.log'),
    }));

    // If we're not in production, also log to the console with a simpler format
    if (process.env.NODE_ENV !== 'production') {
        transports.push(new winston.transports.Console({
            format: consoleFormat,
        }));
    }
}

// Create the logger instance
const logger = winston.createLogger({
    level: 'info', // Log 'info' and higher levels (info, warn, error)
    format: fileFormat,
    transports: transports,
});

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
    write: (message) => {
        if (isLoggingEnabled) {
            logger.info(message.trim());
        }
    },
};

module.exports = logger;