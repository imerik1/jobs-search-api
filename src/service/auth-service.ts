import axios from 'axios';
import database from '~/config/database';
import { devicesUser } from '~/config/db/schema';
import envs from '~/env';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { and, eq } from 'drizzle-orm';
import { userService } from './user-service';
import { NotFoundException } from '~/exceptions/not-found-exception';

interface IApiIpResponse {
	ip: string;
	network: string;
	version: string;
	city: string;
	region: string;
	region_code: string;
	country: string;
	country_name: string;
	country_code: string;
	country_code_iso3: string;
	country_capital: string;
	country_tld: string;
	continent_code: string;
	in_eu: boolean;
	postal: string;
	latitude: number;
	longitude: number;
	timezone: string;
	utc_offset: string;
	country_calling_code: string;
	currency: string;
	currency_name: string;
	languages: string;
	country_area: number;
	country_population: number;
	asn: string;
	org: string;
}

class AuthService {
	constructor() {}

	private async getAddressByIp(ipAddress: string) {
		const url = new URL(envs.IP_API_URI);
		url.pathname = `${ipAddress}/json`;

		const response = await axios.get<IApiIpResponse>(url.toString());

		return {
			city: response.data.city,
			state: response.data.region_code,
			country: response.data.country_code,
		};
	}

	async login(email: string, password: string) {
		const user = await userService.getUserByEmail(email, password);

		if (!user) throw new NotFoundException('User not found');

		return user.id;
	}

	async generateToken(
		userId: bigint,
		source: string,
		ipAddress: string,
		userAgent: string,
	) {
		ipAddress = ipAddress.split(',')[0].trim();
		const address = await this.getAddressByIp(ipAddress);

		const [device] = await database
			.select()
			.from(devicesUser)
			.where(
				and(
					eq(devicesUser.userId, userId),
					eq(devicesUser.ipAddress, ipAddress),
					eq(devicesUser.source, source),
					eq(devicesUser.userAgent, userAgent),
				),
			);

		let deviceId = device?.id;

		if (!deviceId) {
			const [device] = await database
				.insert(devicesUser)
				.values({
					ipAddress,
					userId,
					source,
					userAgent,
					...address,
				})
				.$returningId();
			deviceId = device.id;
		}

		const token = jwt.sign({ sub: deviceId, ip: ipAddress }, envs.JWT_SECRET, {
			expiresIn: ms('8h'),
		});

		return token;
	}
}

export const authService = new AuthService();
