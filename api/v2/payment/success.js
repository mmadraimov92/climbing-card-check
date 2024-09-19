import { respondSuccess } from '../utils/_response.js';

export default async function handler(request, response) {
	if (request.method !== 'GET') {
		return response.status(405).send();
	}

	return respondSuccess(response, 'payment success');
}
