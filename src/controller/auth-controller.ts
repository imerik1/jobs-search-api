import express, { Router } from 'express';
import { ssoService } from '~/service/sso-service';
import zod from 'zod';
import { authService } from '~/service/auth-service';
import envs from '~/env';
import ms from 'ms';

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
	const userId = await ssoService.createOrGetUser(info);
	const token = await authService.generateToken(
		userId,
		provider,
		ipAddress,
		userAgent,
	);

	res.cookie('TOKEN__AUTH', token, { maxAge: ms('8h') + Date.now() });
	return res.redirect(siteRedirectUri);
});

export { authController };
