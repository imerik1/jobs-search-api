import { ResponseStatusException } from './response-status-exception';

export class BadRequestException extends ResponseStatusException {
	constructor(message: string) {
		super(message, 400, []);
	}
}
