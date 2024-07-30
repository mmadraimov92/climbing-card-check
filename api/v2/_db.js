import pg from 'pg';
const { Client } = pg;

export const connect = async () => {
	const config = {
		user: process.env.PGUSER || 'postgres',
		password: process.env.PGPASSWORD || 'postgres',
		host: process.env.PGHOST || '127.0.0.1',
		port: process.env.PGPORT || 5432,
		database: process.env.PGDATABASE || 'postgres',
		query_timeout: 5000,
		connectionTimeoutMillis: 5000,
		ssl: process.env.SSL_CERT ? {
			rejectUnauthorized: false,
			cert: process.env.SSL_CERT,
		} : false,
	};

	const client = new Client(config);
	await client.connect();

	return client;
};

export const fetchClimberById = async (client, id) => {
	const res = await client.query(`
      SELECT
        id,
        certificate,
        name,
        email,
        examiner,
        exam_date AS "examTime",
        expiry_date AS "expiryTime",
        consent_given AS "consentGiven"
      FROM climbers
      WHERE id = $1`, [id]);
	if (!res.rowCount) {
		throw new Error('not found');
	}
	return res.rows[0];
};

export const fetchEmailById = async (client, id) => {
	const res = await client.query(`
      SELECT
        id,
        email,
        email_slug AS "emailSlug",
        created_at,
        email_sent_at,
        email_status
      FROM emails
      WHERE id = $1`, [id]);
	return res.rows[0];
};

export const fetchEmailByEmailSlug = async (client, emailSlug) => {
	const res = await client.query(`
      SELECT
        id,
        email,
        email_slug AS "emailSlug",
        created_at,
        email_sent_at,
        email_status
      FROM emails
      WHERE email_slug = $1`, [emailSlug]);
	return res.rows[0];
};

export const createEmailForId = async (client, id, email) => {
	const res = await client.query('INSERT INTO emails (id, email) VALUES ($1, $2) RETURNING email_slug AS "emailSlug"', [id, email]);
	return res.rows[0];
};

export const markEmailAsSent = async (client, id) => {
	await client.query('UPDATE emails SET email_sent_at = NOW() WHERE id = $1', [id]);
};

export const setEmailStatus = async (client, email, status) => {
	await client.query('UPDATE emails SET email_status = $2, status_updated_at = NOW() WHERE email = $1', [email, status]);
};

export const markClimberAsConsentGiven = async (client, id) => {
	await client.query('UPDATE climbers SET consent_given = TRUE WHERE id = $1', [id]);
};
