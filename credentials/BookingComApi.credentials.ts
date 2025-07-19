import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BookingComApi implements ICredentialType {
	name = 'bookingComApi';
	displayName = 'Booking.com API';
	documentationUrl = 'https://developers.booking.com/demand/docs/open-api/demand-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
				{
					name: 'Production',
					value: 'production',
				},
			],
			default: 'sandbox',
			description: 'The environment to use for API requests',
		},
		{
			displayName: 'Bearer Token',
			name: 'bearerToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Bearer token for API authentication',
		},
		{
			displayName: 'Affiliate ID',
			name: 'affiliateId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Booking.com Affiliate ID',
		},
	];

	// Authentication configuration for HTTP requests
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '={{"Bearer " + $credentials.bearerToken}}',
				'X-Affiliate-Id': '={{$credentials.affiliateId}}',
				'Content-Type': 'application/json',
			},
		},
	};

	// Test the credentials by making a simple API call
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "production" ? "https://demandapi.booking.com/3.1" : "https://demandapi-sandbox.booking.com/3.1"}}',
			url: '/countries',
			method: 'POST',
			body: {
				language: 'en-gb',
			},
		},
	};
} 