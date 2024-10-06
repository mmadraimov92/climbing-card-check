import { strict as assert } from 'assert';

const sendgridApi = 'https://api.sendgrid.com/v3/mail/send';
const templateId = 'd-e65f3cf4f3b94e66b515feaa45542a21';
const from = process.env.FROM_EMAIL_ADDRESS || 'noreply@mmadraimov.eu';

export const sendEmail = async (toName, toEmail, paymentUrl) => {
	const apiKey = process.env.SENDGRID_API_KEY;

	assert.notEqual(apiKey, undefined, 'missing sendgrid api key');
	assert.notEqual(toName, undefined, 'empty toName when sending email');
	assert.notEqual(toEmail, undefined, 'empty toEmail when sending email');
	assert.notEqual(paymentUrl, undefined, 'empty paymentUrl when sending email');

	const body = {
		from:{
			email:from
		},
		personalizations:[
			{
				to:[{email:toEmail}],
				dynamic_template_data:{
					'name':toName,
					'payment_url':paymentUrl,
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
