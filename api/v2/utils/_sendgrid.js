import { strict as assert } from 'assert';
import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook';

const sendgridApi = 'https://api.sendgrid.com/v3/mail/send';
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost:3000';
const templateId = 'd-085549f7a6ec4dc39a7d48878d405140';
const from = process.env.FROM_EMAIL_ADDRESS || 'noreply@mmadraimov.eu';

export const sendEmail = async (toName, toEmail, emailSlug) => {
	const apiKey = process.env.SENDGRID_API_KEY;

	assert.notEqual(apiKey, undefined, 'missing sendgrid api key');
	assert.notEqual(toName, undefined, 'empty toName when sending email');
	assert.notEqual(toEmail, undefined, 'empty toEmail when sending email');
	assert.notEqual(emailSlug, undefined, 'empty emailSlug when sending email');

	const body = {
		from:{
			email:from
		},
		personalizations:[
			{
				to:[{email:toEmail}],
				dynamic_template_data:{
					'name':toName,
					'give_consent_url':'https://'+host+'/api/v2/give_consent?emailSlug='+emailSlug,
				}
			}
		],
		template_id:templateId
	};

	const response = await fetch(sendgridApi, 
		{
			method: 'POST',
			headers:{
				'Authorization': 'Bearer ' + apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body),
		}
	);
	if (!response.ok) {
		const content = await response.json();
		console.log(content);
		throw new Error('email send failed');
	}
};

export const verifyEventWebhook = (headers, payload) => {
	const verify = new EventWebhook();
	const publicKey = process.env.SENDGRID_WEBHOOK_KEY;

	const signature = headers[EventWebhookHeader.SIGNATURE().toLowerCase()];
	const timestamp = headers[EventWebhookHeader.TIMESTAMP().toLowerCase()];

	const ecdsaPublicKey = verify.convertPublicKeyToECDSA(publicKey);
	return verify.verifySignature(
		ecdsaPublicKey,
		payload,
		signature,
		timestamp
	);
};
