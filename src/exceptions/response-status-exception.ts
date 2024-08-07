export class ResponseStatusException extends Error {
	constructor(
		public readonly message: string,
		public readonly status: number,
		public readonly errors: unknown[],
	) {
		super(message);
	}
}
