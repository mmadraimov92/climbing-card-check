import * as db from '../utils/_db.js';
import * as sendgrid from '../utils/_sendgrid.js';
import * as montonio from './_montonio.js';
import { respondSuccess, respondFail } from '../utils/_response.js';
import { validateToken, validateId } from '../utils/_validation.js';

export default async function handler(request, response) {
	if (request.method !== 'POST') {
		return response.status(405).send();
	}

	const token = request.headers['x-webhook-token'] || '';
	try {
		validateToken(token);
	} catch (error) {
		return respondFail(response, error.message);
	}

	const { id } = request.body;
	try {
		validateId(id);
	} catch (error) {
		return respondFail(response, error.message);
	}

	try {
		var dbClient = await db.connect();
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	}

	try {
		const climber = await db.fetchClimberById(dbClient, id);
		if (climber.paymentReceived) {
			return respondSuccess(response, 'already paid');
		}

		let paymentUrl = '';
		let orderID = '';
		const existingPaymentOrder = await db.fetchPaymentOrderByClimberId(dbClient, climber.id);
		if (existingPaymentOrder === undefined || existingPaymentOrder.isExpired) {
			let order = await montonio.createPaymentOrder(climber);
			await db.createPaymentOrder(dbClient, climber, order);
			paymentUrl = order.paymentUrl;
			orderID = order.uuid;
		} else {
			paymentUrl = existingPaymentOrder.paymentUrl;
			orderID = existingPaymentOrder.orderId;
			console.log('sending email with existing payment order, id', orderID);
		}
		
		await sendgrid.sendEmail(climber.name, climber.email, paymentUrl);
		await db.markEmailAsSent(dbClient, orderID);
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	} finally {
		dbClient.end();
	}

	return respondSuccess(response, 'processed');
}
