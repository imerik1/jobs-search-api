export class ResponseStatusException {
	constructor(
		public readonly message: string,
		public readonly status: number,
		public readonly errors: string[],
	) {}
}
