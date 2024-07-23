import pg from 'pg';
const { Client } = pg;

const connect = async () => {
	const config = {
		user: process.env.PGUSER || 'postgres',
		password: process.env.PGPASSWORD || 'postgres',
		host: process.env.PGHOST || 'localhost',
		port: process.env.PGPORT || 5432,
		database: process.env.PGDATABASE || 'postgres',
		query_timeout: 5000,
		connectionTimeoutMillis: 5000,
		ssl: process.env.SSL_MODE || false,
	};

	const client = new Client(config);
	await client.connect();

	return client;
};

const fetchById = async (id) => {
	const client = await connect();
	try {
		const res = await client.query(`
      SELECT
        id,
        certificate,
        name,
        examiner,
        exam_date AS "examTime",
        expiry_date AS "expiryTime"
      FROM climbers
      WHERE id = $1`, [id]);
		if (!res.rowCount) {
			throw new Error('not found');
		}
		return res.rows[0];
	} finally {
		await client.end();
	}
};

export { fetchById };
