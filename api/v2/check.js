import * as db from './_db.js';
import { respondSuccess, respondFail } from './_response.js';
import { validateId } from './_validation.js';

export default async function handler(request, response) {
	if (request.method !== 'GET') {
		return response.status(405).send();
	}

	const { id } = request.query;
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

	await handle(request, response, dbClient);
	dbClient.end();
}

export const handle = async (request, response, dbClient) => {
	const { id } = request.query;

	try {
		const result = await db.fetchClimberById(dbClient, id);
		return respondSuccess(response, 'success', result);
	} catch (error) {
		console.log(error);
		return respondFail(response, error.message);
	}
};
