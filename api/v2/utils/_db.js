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
        payment_received AS "paymentReceived"
      FROM climbers
      WHERE id = $1`, [id]);
	if (!res.rowCount) {
		throw new Error('not found');
	}
	return res.rows[0];
};

export const fetchPaymentOrderByClimberId = async (client, id) => {
	const res = await client.query(`
      SELECT
        order_id AS "orderId",
        status,
        payment_url AS "paymentUrl",
        expires_at < CURRENT_TIMESTAMP AS "isExpired"
      FROM payment_orders
      WHERE climber_id = $1
      ORDER BY created_at DESC
      LIMIT 1`, [id]);
	return res.rows[0];
};

export const createPaymentOrder = async (client, climber, order) => {
	await client.query(
		`INSERT INTO payment_orders (order_id, climber_id, status, amount, payment_url, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		[order.uuid, climber.id, order.paymentStatus, order.grandTotal, order.paymentUrl, order.expiresAt],
	);
};

export const markEmailAsSent = async (client, order_id) => {
	await client.query('UPDATE payment_orders SET email_sent_at = NOW() WHERE order_id = $1', [order_id]);
};

export const markClimberAsPaymentReceived = async (client, id) => {
	await client.query('UPDATE climbers SET payment_received = TRUE WHERE id = $1', [id]);
};

export const updatePaymentOrderStatus = async (client, order) => {
	const res = await client.query('UPDATE payment_orders SET status = $2 WHERE order_id = $1 RETURNING climber_id AS "climberId"', [order.uuid, order.paymentStatus]);
	return res.rows[0].climberId;
};
