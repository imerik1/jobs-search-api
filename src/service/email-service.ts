import ms from 'ms';
import database from '~/config/database';
import { emailVerifiedUser, usersTemporary } from '~/config/db/schema';
import envs from '~/env';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { eq } from 'drizzle-orm';
import { NotFoundException } from '~/exceptions/not-found-exception';
import { userService } from './user-service';

class EmailService {
	private readonly client;

	constructor(host: string, port: number, user: string, pass: string) {
		this.client = nodemailer.createTransport({
			host,
			port,
			secure: true,
			auth: {
				user,
				pass,
			},
		});
	}

	async createUserByConfirmationCode(code: string) {
		const [emailVerifier] = await database
			.select()
			.from(emailVerifiedUser)
			.leftJoin(usersTemporary, eq(usersTemporary.id, emailVerifiedUser.userId))
			.where(eq(emailVerifiedUser.code, code));

		if (!emailVerifier?.EMAIL_VERIFIED_USER || !emailVerifier.USERS_TEMPORARY) {
			throw new NotFoundException('Code not found');
		}

		const { email, firstName, lastName, hash, salt, termsCondition } =
			emailVerifier.USERS_TEMPORARY;

		const userId = await userService.createUser(
			{
				email,
				firstName,
				lastName,
				termsCondition,
				emailVerified: true,
			},
			{ hash, salt },
		);

		return userId;
	}

	async sendConfirmationEmail(email: string, code: string) {
		const mailOptions = {
			from: 'contact@searchjobapi.com',
			to: email,
			subject: 'Confirm your email',
			html: `<a href="${envs.BASE_API_URI}/auth/email/confirmation?code=${code}">Click here</a>`,
		} satisfies Mail.Options;

		await this.client.sendMail(mailOptions);
	}

	async generateCode(userId: bigint) {
		const code = crypto.randomUUID();
		const expiresIn = new Date();
		expiresIn.setTime(Date.now() + ms('1h'));

		await database
			.insert(emailVerifiedUser)
			.values({ userId, expiresIn, code });

		return code;
	}
}

export const emailService = new EmailService(
	envs.MAIL_HOST,
	envs.MAIL_PORT,
	envs.MAIL_USER,
	envs.MAIL_PASS,
);
