
import winston from 'winston';

const log = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()]
})

export default log;
