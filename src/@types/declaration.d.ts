declare namespace Express {
	export interface Request {
		deviceId: bigint;
	}
}

interface BigInt {
	toJSON: () => number;
}
