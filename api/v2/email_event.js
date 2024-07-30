import * as db from './_db.js';
import * as sendgrid from './_sendgrid.js';
import { respondSuccess, respondFail } from './_response.js';

export default async function handler(request, response) {
	if (request.method !== 'POST') {
		return response.status(405).send();
	}

	let data = [];

	request.on('data', chunk => {
		data.push(chunk);
	});

	request.on('end', async () => {
		const buffer = Buffer.concat(data);
		const payload = buffer.toString();

		try {
			if (!sendgrid.verifyEventWebhook(request.headers, payload)) {
				respondFail(response, 'unauthorized');
			}

			var dbClient = await db.connect();
			
			const events = JSON.parse(payload);
			events.sort((a, b) => a.timestamp - b.timestamp);
			for (const e of events) {
				await db.setEmailStatus(dbClient, e.email, e.event);
				console.log('email status update: ', e.email, e.event);
			}
		} catch (error) {
			console.log(error.message);
			respondFail(response, error.message);
		} finally {
			dbClient.end();
		}
		respondSuccess(response, 'sendgrid webhook event processed');
	});
}
