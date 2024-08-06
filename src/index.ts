import envs from './env';

import express from 'express';
import winston from 'winston';
import requestLogger from 'express-winston';
import { authController } from './controller';
import cookieParser from 'cookie-parser';
import * as expressUtils from './utils/express-utils';

const server: express.Express = express();

const loggerConfig = {
	level: envs.LOG_LEVEL,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
	),
	transports: [new winston.transports.Console()],
};
const logger = winston.createLogger(loggerConfig);

server.use(cookieParser());
server.use(requestLogger.logger(loggerConfig));

// Define routes
server.use('/api/v1/auth', authController);
// End

server.use(expressUtils.error);

server.listen(envs.PORT, () => {
	logger.info(`Server is running on port ${envs.PORT}`);
});

export default {
	server,
	logger,
};
