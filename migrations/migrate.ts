import database, { connection } from '~/config/database';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import envs from '~/env';
import path from 'path';

(async function () {
	await migrate(database, {
		migrationsFolder: path.join(process.cwd(), '/migrations'),
		migrationsSchema: envs.DATABASE_NAME,
	});
	await connection.end();
})();
