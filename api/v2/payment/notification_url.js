import { respondSuccess, respondFail } from '../utils/_response.js';
import * as montonio from './_montonio.js';
import * as db from '../utils/_db.js';

export default async function handler(request, response) {
	if (request.method !== 'POST') {
		return response.status(405).send();
	}

	const { orderToken } = request.body;

	let order = {};
	try {
		order = montonio.decodeToken(orderToken);
	} catch {
		return respondFail(response, 'invalid token');
	}

	try {
		var dbClient = await db.connect();
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	}

	try {
		const climberID = await db.updatePaymentOrderStatus(dbClient, order);
		if (order.paymentStatus === 'PAID') {
			await db.markClimberAsPaymentReceived(dbClient, climberID);
		}
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	} finally {
		dbClient.end();
	}

	return respondSuccess(response, 'ok');
}
