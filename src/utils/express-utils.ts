import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import envs from '~/env';
import zod, { ZodError } from 'zod';
import { ResponseStatusException } from '~/exceptions/response-status-exception';
import { logger } from '..';

export const bypass = (req: Request, _: Response, next: NextFunction) => {
	const token = req.cookies['TOKEN__AUTH'];

	if (!token) throw new jwt.JsonWebTokenError('Token is invalid');

	jwt.verify(token, envs.JWT_SECRET, {}, (err, decoded) => {
		if (err) throw new jwt.JsonWebTokenError('Token is invalid', err);

		req.deviceId = BigInt(zod.number().parse(decoded?.sub));
	});

	next();
};

export const error = (
	err: Error,
	_: Request,
	res: Response,
	__: NextFunction,
) => {
	logger.error(`${err.message}\n${err.stack}`);

	if (err instanceof ZodError) {
		return res
			.status(400)
			.json(new ResponseStatusException('Validation failed', 400, err.issues))
			.end();
	}

	if (err instanceof jwt.JsonWebTokenError) {
		return res
			.status(401)
			.json(new ResponseStatusException(err.message, 401, []))
			.end();
	}

	if (err instanceof ResponseStatusException) {
		return res.status(err.status).json(err).end().end();
	}

	return res
		.status(500)
		.json(new ResponseStatusException(err.message, 500, []))
		.end();
};
