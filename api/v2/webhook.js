import * as db from './_db.js';
import * as sendgrid from './_sendgrid.js';

import { validateToken, validateId } from './_validation.js';

export default async function handler(request, response) {
	if (request.method !== 'POST') {
		return response.status(405).send();
	}

	const start = Date.now();

	const token = request.headers['x-webhook-token'] || '';
	try {
		validateToken(token);
	} catch {
		return response.status(401).send();
	}

	const { id } = request.body;
	try {
		validateId(id);
	} catch (error) {
		return response.status(400).json(error.message);
	}

	try {
		var dbClient = await db.connect();
	} catch (error) {
		console.log(error);
		return response.status(500).json(error.message);
	}

	try {
		const climber = await db.fetchClimberById(dbClient, id); 
		if (climber.consentGiven) {
			return response.status(200).json({ success:true, id, message: 'consent already given' });
		}

		let emailSlug = '';
		const email = await db.fetchEmailById(dbClient, climber.id);
		if (email === undefined) {
			emailSlug = await db.createEmailForId(dbClient, climber.id, climber.email);
		} else {
			emailSlug = email.emailSlug;
		}
  
		await sendgrid.sendEmail(climber.name, climber.email, emailSlug);
		await db.markEmailAsSentForId(dbClient, climber.id);
	} catch (error) {
		console.log(error);
		return response.status(200).json({ success:false, id, message: error.message });
	} finally {
		console.log({ ts: new Date(), responseTime: Date.now() - start, id});
		dbClient.end();
	}

	return response.status(200).json({ success:true, id, message: 'processed' });
}
