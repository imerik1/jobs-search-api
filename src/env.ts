import dotenv from 'dotenv';
import zod from 'zod';
import { isPositive } from './utils/zod-utils';

dotenv.config();

const schema = zod.object({
	JWT_SECRET: zod.string(),
	CRYPTO_SECRET: zod.string(),
	FRONT_REDIRECT_URI: zod.string(),

	MAIL_HOST: zod.string(),
	MAIL_PORT: zod.preprocess(isPositive, zod.number()),
	MAIL_USER: zod.string(),
	MAIL_PASS: zod.string(),

	BASE_API_URI: zod.string().default('http://localhost:8080/api/v1'),

	IP_API_URI: zod.string(),

	PORT: zod.preprocess(isPositive, zod.number().default(8080)),
	LOG_LEVEL: zod
		.string()
		.transform((level) => level.toLowerCase())
		.default('info'),

	LINKEDIN_API_URI: zod.string(),
	LINKEDIN_AUTH_URI: zod.string(),
	LINKEDIN_CLIENT_ID: zod.string(),
	LINKEDIN_CLIENT_SECRET: zod.string(),
	LINKEDIN_REDIRECT_URI: zod.string(),

	DATABASE_HOST: zod.string(),
	DATABASE_USER: zod.string(),
	DATABASE_PASS: zod.string(),
	DATABASE_PORT: zod.preprocess(Number, zod.number()),
	DATABASE_NAME: zod.string(),
});

export default schema.parse(process.env);
