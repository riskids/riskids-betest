const winston = require('winston');
const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: 'error',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
