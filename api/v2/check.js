import * as db from './_db.js';

import { validateId } from './_validation.js';

export default async function handler(request, response) {
	const start = Date.now();

	const { id } = request.query;
	try {
		validateId(id);
	} catch (err) {
		return response.status(400).json(err.message);
	}

	console.log({ ts: new Date(), responseTime: Date.now() - start, id});
	try {
		const result = await db.fetchById(id); 
		return response.status(200).json({success:true, ...result});
	} catch (error) {
		console.log(error);
		return response.status(200).json({success:false, id, message: error.message });
	}
}
