import * as db from './_db.js';
import { validateEmailSlug } from './_validation.js';
import { respondSuccess, respondFail } from './_response.js';

export default async function handler(request, response) {
	if (request.method !== 'GET') {
		return response.status(405).send();
	}

	const { emailSlug } = request.query;
	try {
		validateEmailSlug(emailSlug);
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
		const email = await db.fetchEmailByEmailSlug(dbClient, emailSlug);
		if (email === undefined) {
			return respondFail(response, 'email not found');
		}
		
		await db.markClimberAsConsentGiven(dbClient, email.id);
		return respondSuccess(response, 'consent given');
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	} finally {
		dbClient.end();
	}
}
