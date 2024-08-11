import { suite, before, after, test } from 'node:test';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { requestMock, responseMock } from './_utils.js';
import assert from 'node:assert/strict';
import { handle } from '../../api/v2/check.js';
import fs from 'fs';
import pg from 'pg';

const { Client } = pg;
const schema = fs.readFileSync('db/schema.sql').toString();
const fixture = fs.readFileSync('test/v2/fixture.sql').toString();

suite('Climbers certificate check endpoint', () => {
	let container;
	let dbClient;

	before(async () => {
		container = await new PostgreSqlContainer('postgres:15-alpine').start();
		dbClient = new Client({ connectionString: container.getConnectionUri() });
		await dbClient.connect();
		await dbClient.query(schema);
		await dbClient.query(fixture);
	});

	after(async () => {
		await dbClient.end();
		await container.stop();
	});

	test('climber not found', async () => {
		const request = requestMock('GET', {id:'12345678901'});
		const response = responseMock();
		await handle(request, response, dbClient);

		assert.equal(response.statusCode, 200);
		assert.equal(response.body.success, false);
		assert.equal(response.body.message, 'not found');
	});

	test('climber with green certificate', async () => {
		const request = requestMock('GET', {id:'10000000000'});
		const response = responseMock();
		await handle(request, response, dbClient);

		assert.equal(response.statusCode, 200);
		assert.equal(response.body.success, true);
		assert.equal(response.body.message, 'success');
		assert.equal(response.body.certificate, 'green');
	});
});
