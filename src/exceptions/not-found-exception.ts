import { ResponseStatusException } from './response-status-exception';

export class NotFoundException extends ResponseStatusException {
	constructor(message: string) {
		super(message, 404, []);
	}
}
