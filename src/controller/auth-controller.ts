import express, { Router } from 'express';
import { ssoService } from '~/service/sso-service';
import zod from 'zod';
import { authService } from '~/service/auth-service';
import envs from '~/env';
import ms from 'ms';
import { userService } from '~/service/user-service';
import { emailService } from '~/service/email-service';

const authController: express.Router = Router();

authController.get('/sso/authorize', (req, res) => {
	const query = zod.object({
		provider: zod.string(),
		site_redirect_uri: zod.string().default(envs.FRONT_REDIRECT_URI),
	});
	const { provider, site_redirect_uri: siteRedirectUri } = query.parse(
		req.query,
	);

	const redirectUri = ssoService.getAuthorizationUri(provider, siteRedirectUri);
	redirectUri.searchParams.append('provider', provider);

	return res.redirect(redirectUri.toString());
});

authController.get('/sso/callback', async (req, res) => {
	const headers = zod.object({
		'user-agent': zod.string(),
		'x-forwarded-for': zod.string().default(req.socket.remoteAddress!),
	});
	const query = zod.object({
		provider: zod.string(),
		code: zod.string(),
		site_redirect_uri: zod.string().default(envs.FRONT_REDIRECT_URI),
	});

	const {
		provider,
		code,
		site_redirect_uri: siteRedirectUri,
	} = query.parse(req.query);
	const { 'user-agent': userAgent, 'x-forwarded-for': ipAddress } =
		headers.parse(req.headers);

	const accessToken = await ssoService.getAccessToken(
		provider,
		code,
		siteRedirectUri,
	);
	const info = await ssoService.getInfo(provider, accessToken);
	const userId = await ssoService.createOrGetUser(info, true);
	const token = await authService.generateToken(
		userId,
		provider,
		ipAddress,
		userAgent,
	);

	res.cookie('TOKEN__AUTH', token, { maxAge: ms('8h') + Date.now() });
	return res.redirect(siteRedirectUri);
});

authController.post('/sign-in', async (req, res) => {
	const body = zod.object({
		email: zod.string().email(),
		password: zod
			.string()
			.regex(new RegExp(/(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/gm)),
	});
	const headers = zod.object({
		'user-agent': zod.string(),
		'x-forwarded-for': zod.string().default(req.socket.remoteAddress!),
	});
	const query = zod.object({
		site_redirect_uri: zod.string().default(envs.FRONT_REDIRECT_URI),
	});

	const { site_redirect_uri: siteRedirectUri } = query.parse(req.query);
	const { email, password } = body.parse(req.body);
	const { 'user-agent': userAgent, 'x-forwarded-for': ipAddress } =
		headers.parse(req.headers);

	const userId = await authService.login(email, password);
	const token = await authService.generateToken(
		userId,
		'password',
		ipAddress,
		userAgent,
	);

	res.cookie('TOKEN__AUTH', token, { maxAge: ms('8h') + Date.now() });
	return res.redirect(siteRedirectUri);
});

authController.post('/sign-up', async (req, res) => {
	const body = zod.object({
		email: zod.string().email(),
		password: zod
			.string()
			.regex(new RegExp(/(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/gm)),
		firstName: zod.string().max(30),
		lastName: zod.string().max(30),
		termsCondition: zod.literal<boolean>(true),
	});
	const { email, password, firstName, lastName, termsCondition } = body.parse(
		req.body,
	);

	const userId = await userService.createUserTemporary(
		{ email, firstName, lastName, termsCondition },
		password,
	);
	const code = await emailService.generateCode(userId);

	await emailService.sendConfirmationEmail(email, code);

	return res.status(204).end();
});

authController.post('/email/resend', async (req, res) => {
	const body = zod.object({
		email: zod.string().email(),
	});
	const { email } = body.parse(req.body);

	const user = await userService.getUserByEmail(email);

	if (!user) {
		return res.status(204).end();
	}

	const code = await emailService.generateCode(user.id);
	await emailService.sendConfirmationEmail(email, code);

	return res.status(204).end();
});

authController.get('/email/confirmation', async (req, res) => {
	const query = zod.object({
		code: zod.string(),
	});
	const { code } = query.parse(req.query);

	await emailService.createUserByConfirmationCode(code);
	return res.status(204).end();
});

export { authController };
