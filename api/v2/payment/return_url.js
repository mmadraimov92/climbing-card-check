import { respondFail, respondSuccess } from '../utils/_response.js';
import * as montonio from './_montonio.js';

export default async function handler(request, response) {
	if (request.method !== 'GET') {
		return response.status(405).send();
	}

	
	const orderToken = request.query['order-token'];
	try {
		montonio.decodeToken(orderToken);
	} catch {
		return respondFail(response, 'invalid token');
	}

	return respondSuccess(response, 'payment success');
}
