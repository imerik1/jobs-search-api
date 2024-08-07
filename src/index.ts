import 'express-async-errors';
import * as polyfill from './utils/polyfill';
import envs from './env';
import express from 'express';
import winston from 'winston';
import requestLogger from 'express-winston';
import { authController, userController } from './controller';
import cookieParser from 'cookie-parser';
import * as expressUtils from './utils/express-utils';

const server: express.Express = express();
polyfill.init();

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
server.use(express.json());
server.use(requestLogger.logger(loggerConfig));

// Define routes
server.use('/api/v1/auth', authController);
server.use('/api/v1/user', expressUtils.bypass, userController);
server.use('/health', expressUtils.health);
// End

server.use(expressUtils.error);

server.listen(envs.PORT, () => {
	logger.info(`Server is running on port ${envs.PORT}`);
});

export { server, logger };
