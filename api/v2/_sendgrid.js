import { strict as assert } from 'assert';

const sendgridApi = 'https://api.sendgrid.com/v3/mail/send';
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost';
const templateId = 'd-085549f7a6ec4dc39a7d48878d405140';

const sendEmail = async (toName, toEmail, emailSlug) => {
	const apiKey = process.env.SENDGRID_API_KEY;

	assert.notEqual(apiKey, undefined, 'missing sendgrid api key');
	assert.notEqual(toName, undefined, 'empty toName when sending email');
	assert.notEqual(toEmail, undefined, 'empty toEmail when sending email');
	assert.notEqual(emailSlug, undefined, 'empty emailSlug when sending email');

	const body = {
		from:{
			email:'mmadraimov@gmail.com'
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

export { sendEmail };
