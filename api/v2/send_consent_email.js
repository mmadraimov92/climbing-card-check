import * as db from './utils/_db.js';
import * as sendgrid from './utils/_sendgrid.js';
import { respondSuccess, respondFail } from './utils/_response.js';
import { validateToken, validateId } from './utils/_validation.js';

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
		if (climber.consentGiven) {
			return respondSuccess(response, 'consent already given');
		}

		let emailSlug = '';
		const email = await db.fetchEmailSlugByEmail(dbClient, climber.email);
		if (email === undefined) {
			const result = await db.createEmailSlugForId(dbClient, climber.id, climber.email);
			emailSlug = result.emailSlug;
		} else {
			emailSlug = email.emailSlug;
		}
		await sendgrid.sendEmail(climber.name, climber.email, emailSlug);
		await db.markEmailAsSent(dbClient, climber.id);
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	} finally {
		dbClient.end();
	}

	return respondSuccess(response, 'processed');
}
