import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import database from '~/config/database';
import { passwordUser, users } from '~/config/db/schema';

class UserService {
	constructor() {}

	private comparePassword(hash: string, salt: string, password: string) {
		const encryptHash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512');

		return crypto.timingSafeEqual(Buffer.from(hash), encryptHash);
	}

	async getUserByEmail(email: string, passwr?: string) {
		const [user] = await database
			.select()
			.from(users)
			.where(eq(users.email, email));

		if (!user) return null;

		if (passwr) {
			const [password] = await database
				.select()
				.from(passwordUser)
				.where(eq(passwordUser.userId, user.id));

			if (this.comparePassword(password.hash, password.salt, passwr)) {
				return user;
			} else {
				return null;
			}
		}

		return user;
	}

	private generatePassword(password: string) {
		const salt = crypto.randomBytes(128).toString('base64');
		const hash = crypto
			.pbkdf2Sync(password, salt, 10000, 512, 'sha512')
			.toString('base64');

		return { hash, salt };
	}

	async createUser(payload: typeof users.$inferInsert, password?: string) {
		const [user] = await database.insert(users).values(payload).$returningId();

		if (password) {
			const { hash, salt } = this.generatePassword(password);

			await database
				.insert(passwordUser)
				.values({ hash, salt, userId: user.id });
		}

		return user.id;
	}
}

export const userService = new UserService();
