import database from '~/config/database';
import { linkedinService } from './linkedin-service';
import { users } from '~/config/db/schema';
import { eq } from 'drizzle-orm';
import { userService } from './user-service';
import { ResponseStatusException } from '~/exceptions/response-status-exception';

export interface ISSOServiceInfo {
	firstName: string;
	lastName: string;
	email: string;
	profilePhoto: string;
}

export interface ISSOService {
	getAuthorizationUri: (siteRedirectUri: string) => URL;
	getAccessToken: (code: string, siteRedirectUri: string) => Promise<string>;
	getInfo: (accessToken: string) => Promise<ISSOServiceInfo>;
}

class SSOService {
	constructor() {}

	getAuthorizationUri(provider: string, siteRedirectUri: string) {
		switch (provider) {
			case 'linkedin': {
				return linkedinService.getAuthorizationUri(siteRedirectUri);
			}
			default: {
				throw new ResponseStatusException('Provider not supported', 400, []);
			}
		}
	}

	async getAccessToken(
		provider: string,
		code: string,
		siteRedirectUri: string,
	) {
		switch (provider) {
			case 'linkedin': {
				return linkedinService.getAccessToken(code, siteRedirectUri);
			}
			default: {
				throw new ResponseStatusException('Provider not supported', 400, []);
			}
		}
	}

	async getInfo(
		provider: string,
		accessToken: string,
	): Promise<ISSOServiceInfo> {
		switch (provider) {
			case 'linkedin': {
				return linkedinService.getInfo(accessToken);
			}
			default: {
				throw new ResponseStatusException('Provider not supported', 400, []);
			}
		}
	}

	async createOrGetUser(info: ISSOServiceInfo) {
		const user = await userService.getUserByEmail(info.email);
		let userId = user?.id;

		if (!user) {
			userId = await userService.createUser({
				firstName: info.firstName,
				lastName: info.lastName,
				email: info.email,
				picture: info.profilePhoto,
			});
		}

		return userId!;
	}
}

export const ssoService = new SSOService();
