import { strict as assert } from 'assert';

const validateId = (id) => {
	assert.equal(typeof id, 'string', 'Expected ID to be a string');
	assert.match(id, /[0-9]{11}/, 'Expected ID to consist of 11 digits');
};

const validateToken = (token) => {
	assert.equal(token, process.env.WEBHOOK_TOKEN, 'Invalid token');
};

const validateEmailSlug = (emailSlug) => {
	assert.equal(typeof emailSlug, 'string', 'invalid email slug');
	assert.equal(emailSlug.length, 36, 'invalid email slug');
};

export { validateId, validateToken, validateEmailSlug };
