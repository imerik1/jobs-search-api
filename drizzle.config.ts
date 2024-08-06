import { defineConfig } from 'drizzle-kit';
import path from 'path';
import envs from '~/env';
import fs from 'fs';

export default defineConfig({
	schema: './src/config/db/schema.ts',
	out: './migrations',
	dialect: 'mysql',
	verbose: true,
	dbCredentials: {
		host: envs.DATABASE_HOST,
		user: envs.DATABASE_USER,
		password: envs.DATABASE_PASS,
		database: envs.DATABASE_NAME,
		ssl: {
			ca: fs.readFileSync(path.join(process.cwd(), 'ca.pem')).toString('utf-8'),
		},
	},
});
