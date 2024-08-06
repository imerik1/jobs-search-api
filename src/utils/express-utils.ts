import { NextFunction, Response, Request } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import envs from '~/env';
import zod from 'zod';
import { ResponseStatusException } from '~/exceptions/response-status-exception';

export const bypass = (req: Request, _: Response, next: NextFunction) => {
	const token = req.cookies['TOKEN__AUTH'];

	if (!token) throw new JsonWebTokenError('Token is invalid');

	jwt.verify(token, envs.JWT_SECRET, {}, (err, decoded) => {
		if (err) throw new JsonWebTokenError('Token is invalid', err);

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
	if (err instanceof JsonWebTokenError) {
		return res.json(new ResponseStatusException(err.message, 401, []));
	}

	if (err instanceof ResponseStatusException) {
		return res.json(err).end();
	}

	return res.json(new ResponseStatusException(err.message, 500, []));
};
