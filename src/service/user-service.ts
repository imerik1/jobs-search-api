import * as crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import database from '~/config/database';
import {
	devicesUser,
	passwordUser,
	users,
	usersTemporary,
} from '~/config/db/schema';
import { NotFoundException } from '~/exceptions/not-found-exception';

interface IPasswordConfig {
	hash: string;
	salt: string;
}

class UserService {
	constructor() {}

	private comparePassword(hash: string, salt: string, password: string) {
		const encryptHash = crypto.pbkdf2Sync(password, salt, 50, 128, 'sha512');

		return crypto.timingSafeEqual(Buffer.from(hash, 'base64'), encryptHash);
	}

	async getUserByEmail(email: string, passwr?: string) {
		const [user] = await database
			.select()
			.from(users)
			.where(
				and(
					eq(users.email, email),
					eq(users.emailVerified, true),
					eq(users.deleted, false),
				),
			);

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
			.pbkdf2Sync(password, salt, 50, 128, 'sha512')
			.toString('base64');

		return { hash, salt };
	}

	async getUserByDeviceId(deviceId: bigint) {
		const [device] = await database
			.select()
			.from(devicesUser)
			.leftJoin(users, eq(devicesUser.userId, users.id))
			.where(eq(devicesUser.id, deviceId));

		if (!device?.USERS) {
			throw new NotFoundException('Device not found');
		}

		return device.USERS;
	}

	async createUserTemporary(
		payload: Omit<typeof usersTemporary.$inferInsert, 'hash' | 'salt'>,
		password: string,
	) {
		const { hash, salt } = this.generatePassword(password);

		const [user] = await database
			.insert(usersTemporary)
			.values({ ...payload, hash, salt })
			.$returningId();

		return user.id;
	}

	async createUser(
		payload: typeof users.$inferInsert,
		password?: IPasswordConfig,
	) {
		const [user] = await database.insert(users).values(payload).$returningId();

		if (user.id && password?.hash && password.salt) {
			await database
				.insert(passwordUser)
				.values({ hash: password.hash, salt: password.salt, userId: user.id });
		}

		return user?.id;
	}
}

export const userService = new UserService();
