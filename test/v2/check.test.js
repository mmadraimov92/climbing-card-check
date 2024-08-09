import { suite, before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
const { Client } = pg;

const schema = fs.readFileSync('db/schema.sql').toString();
const fixture = fs.readFileSync('test/v2/fixture.sql').toString();

suite('Check climbers certificate endpoint', () => {
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
	
	test('climbers count', async () => {
		const res = await dbClient.query('SELECT count(*) FROM climbers;');
		assert.equal(res.rows[0].count, '1');
	});
});
