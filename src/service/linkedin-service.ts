import envs from '~/env';
import { ISSOService } from './sso-service';
import axios from 'axios';
import { NotFoundException } from '~/exceptions/not-found-exception';
import { ResponseException } from '~/exceptions/response-exception';
import { BadRequestException } from '~/exceptions/bad-request-exception';

const {
	LINKEDIN_CLIENT_ID,
	LINKEDIN_CLIENT_SECRET,
	LINKEDIN_API_URI,
	LINKEDIN_AUTH_URI,
	LINKEDIN_REDIRECT_URI,
} = envs;

interface ILinkedinAccessToken {
	access_token: string;
	expires_in: number;
	scope: string;
}

interface ILinkedinUserInfo {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
	email: string;
	email_verified: boolean;
}

class LinkedinService implements ISSOService {
	constructor(
		private readonly baseAuthUrl: string,
		private readonly baseApiUrl: string,
		private readonly redirectUri: string,
		private readonly clientId: string,
		private readonly clientSecret: string,
	) {}

	getAuthorizationUri(siteRedirectUri: string) {
		const linkedinUrl = new URL(`${this.baseAuthUrl}/authorization`);
		linkedinUrl.searchParams.append('response_type', 'code');
		linkedinUrl.searchParams.append('client_id', this.clientId);
		linkedinUrl.searchParams.append('scope', 'profile email openid');

		const redirectUri = new URL(this.redirectUri);
		redirectUri.searchParams.append('site_redirect_uri', siteRedirectUri);
		linkedinUrl.searchParams.append('redirect_uri', redirectUri.toString());

		return linkedinUrl;
	}

	async getAccessToken(code: string, siteRedirectUri: string) {
		const linkedinUrl = new URL(`${this.baseAuthUrl}/accessToken`);
		linkedinUrl.searchParams.append('code', code);
		linkedinUrl.searchParams.append('grant_type', 'authorization_code');
		linkedinUrl.searchParams.append('client_id', this.clientId);
		linkedinUrl.searchParams.append('client_secret', this.clientSecret);

		const redirectUri = new URL(this.redirectUri);
		redirectUri.searchParams.append('site_redirect_uri', siteRedirectUri);
		linkedinUrl.searchParams.append('redirect_uri', redirectUri.toString());

		const response = await axios.post<ILinkedinAccessToken>(
			linkedinUrl.toString(),
		);

		return response.data.access_token;
	}

	async getInfo(accessToken: string) {
		const linkedinUrl = new URL(`${this.baseApiUrl}/userinfo`);

		const response = await axios.get<ILinkedinUserInfo>(
			linkedinUrl.toString(),
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		if (!response.data.email_verified) {
			throw new BadRequestException(
				'User is trying to log in with a non user verified',
			);
		}

		return {
			firstName: response.data.given_name,
			lastName: response.data.family_name,
			email: response.data.email,
			profilePhoto: response.data.picture,
		};
	}
}

export const linkedinService = new LinkedinService(
	LINKEDIN_AUTH_URI,
	LINKEDIN_API_URI,
	LINKEDIN_REDIRECT_URI,
	LINKEDIN_CLIENT_ID,
	LINKEDIN_CLIENT_SECRET,
);
