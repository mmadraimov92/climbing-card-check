import jwt from 'jsonwebtoken';
import { strict as assert } from 'assert';

const montonioApi = process.env.MONTONIO_PRODUCTION === 'true' ?
	'https://stargate.montonio.com/api/orders' :
	'https://sandbox-stargate.montonio.com/api/orders';

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost:3000';
const price = 10;
const montonioAccessKey = process.env.MONTONIO_ACCESS_KEY;
const montonioSecretKey = process.env.MONTONIO_SECRET_KEY;

export const createPaymentOrder = async (climber) => {
	assert.notEqual(montonioAccessKey, undefined, 'missing Montonio access key');
	assert.notEqual(montonioSecretKey, undefined, 'missing Montonio secret key');

	const name = climber.name.split(' ');
	const lastName = name.pop();
	const firstName = name.join(' ');

	const payload = {
		'accessKey': montonioAccessKey,
		'merchantReference': climber.name +' - '+ crypto.randomUUID(),
		'returnUrl': 'https://'+host+'/api/v2/payment/return_url',
		'notificationUrl': 'https://'+host+'/api/v2/payment/notification_url',
		'currency': 'EUR',
		'grandTotal': price,
		'locale': 'et',
		'billingAddress': {
			'firstName': firstName,
			'lastName': lastName,
			'email': climber.email,
		},
		'payment': {
			'method': 'paymentInitiation',
			'methodDisplay': 'Pay with your bank',
			'methodOptions': {
				'paymentDescription': 'Payment for Climbing Card',
				'preferredCountry': 'EE',
				'preferredLocale': 'et',
			},
			'amount': price,
			'currency': 'EUR'
		},
		'expiresIn': 1440 // payment url expires in 24h
	};
  
	const token = jwt.sign(
		payload, 
		montonioSecretKey,
		{ algorithm: 'HS256', expiresIn: '10m' }
	);

	const body = JSON.stringify({data: token});
	const response = await fetch(montonioApi,
		{
			method: 'POST',
			headers:{
				'Content-Type': 'application/json'
			},
			body: body,
		}
	);
	if (!response.ok) {
		const content = await response.json();
		console.log(content);
		console.log('create payment order failed for:', climber.name);
		throw new Error('create payment order failed');
	}

	const data  = await response.json();
	console.log('created payment order:', data.uuid);
	return data;
};

export const decodeToken = (token) => {
	return jwt.verify(token, montonioSecretKey);
};
