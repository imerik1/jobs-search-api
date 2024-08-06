export const isPositive = (arg: unknown) => {
	if (typeof arg === 'number') {
		return arg;
	}

	if (!arg) {
		return undefined;
	}

	return parseInt(arg as any);
};

export const extractToken = (arg: unknown) => {
	if (typeof arg !== 'string') {
		return null;
	}

	if (!arg.startsWith('Bearer ')) {
		return null;
	}

	return arg.split(' ')[1];
};
