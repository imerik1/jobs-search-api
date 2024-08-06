import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import envs from '~/env';
import * as schema from './db/schema';

export const connection = mysql.createPool({
	host: envs.DATABASE_HOST,
	user: envs.DATABASE_USER,
	password: envs.DATABASE_PASS,
	port: envs.DATABASE_PORT,
	database: envs.DATABASE_NAME,
	connectionLimit: 2,
	multipleStatements: true,
	ssl: {
		ca: fs.readFileSync(path.join(process.cwd(), 'ca.pem')),
	},
});

export default drizzle(connection, { schema, mode: 'default' });
