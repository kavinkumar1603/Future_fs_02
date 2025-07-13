const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
    this.logToFile = process.env.NODE_ENV === 'production';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaString}`;
  }

  writeToFile(level, formattedMessage) {
    if (!this.logToFile) return;

    const filename = level === 'ERROR' ? 'error.log' : 'combined.log';
    const filepath = path.join(logsDir, filename);
    
    fs.appendFileSync(filepath, formattedMessage + '\n', 'utf8');
  }

  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > this.logLevel) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const color = LOG_COLORS[level] || LOG_COLORS.RESET;
    console.log(`${color}${formattedMessage}${LOG_COLORS.RESET}`);
    
    // File output (production only)
    this.writeToFile(level, formattedMessage);
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Express middleware for request logging
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const method = req.method;
        const url = req.originalUrl;
        const userAgent = req.get('User-Agent') || 'Unknown';
        
        const level = statusCode >= 400 ? 'ERROR' : statusCode >= 300 ? 'WARN' : 'INFO';
        
        this.log(level, `${method} ${url} ${statusCode}`, {
          duration: `${duration}ms`,
          userAgent,
          ip: req.ip
        });
      });
      
      next();
    };
  }
}

module.exports = new Logger();
