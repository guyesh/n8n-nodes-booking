import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class BookingCom implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Booking.com',
		name: 'bookingCom',
		icon: 'file:booking.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Booking.com Demand API',
		defaults: {
			name: 'Booking.com',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'bookingComApi',
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Accommodation',
						value: 'accommodations',
					},
					{
						name: 'Location',
						value: 'locations',
					},
					{
						name: 'Order',
						value: 'orders',
					},
					{
						name: 'Payment',
						value: 'payments',
					},
				],
				default: 'accommodations',
			},

			// Accommodations Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['accommodations'],
					},
				},
				options: [
					{
						name: 'Bulk Availability',
						value: 'bulkAvailability',
						description: 'Check availability for multiple accommodations',
						action: 'Check bulk accommodation availability',
					},
					{
						name: 'Check Availability',
						value: 'checkAvailability',
						description: 'Check availability for specific accommodation',
						action: 'Check accommodation availability',
					},
					{
						name: 'Get Chains',
						value: 'getChains',
						description: 'Get accommodation chains',
						action: 'Get accommodation chains',
					},
					{
						name: 'Get Constants',
						value: 'getConstants',
						description: 'Get accommodation constants',
						action: 'Get accommodation constants',
					},
					{
						name: 'Get Details',
						value: 'getDetails',
						description: 'Get detailed information about accommodation',
						action: 'Get accommodation details',
					},
					{
						name: 'Get Reviews',
						value: 'getReviews',
						description: 'Get reviews for accommodation',
						action: 'Get accommodation reviews',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search for accommodations',
						action: 'Search accommodations',
					},
				],
				default: 'search',
			},

			// Locations Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['locations'],
					},
				},
				options: [
					{
						name: 'Get Cities',
						value: 'getCities',
						description: 'Get list of cities',
						action: 'Get cities',
					},
					{
						name: 'Get Countries',
						value: 'getCountries',
						description: 'Get list of countries',
						action: 'Get countries',
					},
					{
						name: 'Get Airports',
						value: 'getAirports',
						description: 'Get list of airports',
						action: 'Get airports',
					},
					{
						name: 'Get Landmarks',
						value: 'getLandmarks',
						description: 'Get list of landmarks',
						action: 'Get landmarks',
					},
				],
				default: 'getCities',
			},

			// Orders Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['orders'],
					},
				},
				options: [
					{
						name: 'Create Booking',
						value: 'createBooking',
						description: 'Create a new booking',
						action: 'Create booking',
					},
					{
						name: 'Get Order Details',
						value: 'getOrderDetails',
						description: 'Get details of an order',
						action: 'Get order details',
					},
					{
						name: 'Cancel Order',
						value: 'cancelOrder',
						description: 'Cancel an existing order',
						action: 'Cancel order',
					},
					{
						name: 'Modify Order',
						value: 'modifyOrder',
						description: 'Modify an existing order',
						action: 'Modify order',
					},
				],
				default: 'getOrderDetails',
			},

			// Payments Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['payments'],
					},
				},
				options: [
					{
						name: 'Get Payment Methods',
						value: 'getPaymentMethods',
						description: 'Get available payment methods',
						action: 'Get payment methods',
					},
					{
						name: 'Process Payment',
						value: 'processPayment',
						description: 'Process a payment',
						action: 'Process payment',
					},
				],
				default: 'getPaymentMethods',
			},

			// Common fields
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'Dutch', value: 'nl' },
					{ name: 'English (GB)', value: 'en-gb' },
					{ name: 'English (US)', value: 'en-us' },
					{ name: 'French', value: 'fr' },
					{ name: 'German', value: 'de' },
					{ name: 'Italian', value: 'it' },
					{ name: 'Spanish', value: 'es' },
				],
				default: 'en-gb',
				description: 'Language for the response',
			},

			// Search-specific parameters
			{
				displayName: 'Check-in Date',
				name: 'checkinDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['accommodations'],
						operation: ['search', 'checkAvailability', 'bulkAvailability'],
					},
				},
				default: '',
				required: true,
				description: 'Check-in date (YYYY-MM-DD format)',
			},
			{
				displayName: 'Check-Out Date',
				name: 'checkoutDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['accommodations'],
						operation: ['search', 'checkAvailability', 'bulkAvailability'],
					},
				},
				default: '',
				required: true,
				description: 'Check-out date (YYYY-MM-DD format)',
			},
			{
				displayName: 'Destination ID',
				name: 'destId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['accommodations'],
						operation: ['search'],
					},
				},
				default: '',
				required: true,
				description: 'Destination ID for search location',
			},
			{
				displayName: 'Hotel IDs',
				name: 'hotelIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['accommodations'],
						operation: ['checkAvailability', 'bulkAvailability', 'getDetails', 'getReviews'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of hotel IDs',
			},
			{
				displayName: 'Adults',
				name: 'adults',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['accommodations'],
						operation: ['search', 'checkAvailability', 'bulkAvailability'],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 30,
				},
				default: 2,
				description: 'Number of adults',
			},
			{
				displayName: 'Children Ages',
				name: 'childrenAges',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['accommodations'],
						operation: ['search', 'checkAvailability', 'bulkAvailability'],
					},
				},
				default: '',
				description: 'Comma-separated list of children ages (0-17)',
				placeholder: '5,12',
			},

			// Order-specific parameters
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['orders'],
						operation: ['getOrderDetails', 'cancelOrder', 'modifyOrder'],
					},
				},
				default: '',
				required: true,
			},

			// Location filters
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['locations'],
						operation: ['getCities', 'getAirports'],
					},
				},
				default: '',
				description: 'ISO 3166-1 alpha-2 country code',
				placeholder: 'US',
			},

			// Additional options
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Currency',
						name: 'currency',
						type: 'string',
						default: 'USD',
						description: 'Currency code (ISO 4217)',
					},
					{
						displayName: 'Rows',
						name: 'rows',
						type: 'number',
						default: 25,
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
						description: 'Number of results to return',
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Number of results to skip',
					},
					{
						displayName: 'Sort By',
						name: 'sortBy',
						type: 'options',
						options: [
							{ name: 'Price', value: 'price' },
							{ name: 'Distance', value: 'distance' },
							{ name: 'Review Score', value: 'review_score' },
							{ name: 'Popularity', value: 'popularity' },
						],
						default: 'popularity',
						description: 'Sort results by',
					},
				],
			},
		],
	};

		async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const language = this.getNodeParameter('language', i, 'en-gb') as string;
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

				// Get credentials
				const credentials = await this.getCredentials('bookingComApi');
				const environment = credentials.environment as string;
				const baseURL = environment === 'production' 
					? 'https://demandapi.booking.com/3.1' 
					: 'https://demandapi-sandbox.booking.com/3.1';

				let endpoint = '';
				let requestBody: IDataObject = { language };
				let responseData: IDataObject;

				// Handle different resources and operations
				if (resource === 'accommodations') {
					if (operation === 'search') {
						endpoint = '/accommodations';
						const destId = this.getNodeParameter('destId', i) as string;
						const checkinDate = this.getNodeParameter('checkinDate', i) as string;
						const checkoutDate = this.getNodeParameter('checkoutDate', i) as string;
						const adults = this.getNodeParameter('adults', i, 2) as number;
						const childrenAges = this.getNodeParameter('childrenAges', i, '') as string;

						requestBody = {
							...requestBody,
							dest_id: destId,
							checkin: checkinDate.split('T')[0],
							checkout: checkoutDate.split('T')[0],
							adults,
							...additionalOptions,
						};

						if (childrenAges) {
							requestBody.children_ages = childrenAges.split(',').map(age => parseInt(age.trim()));
						}
					} else if (operation === 'checkAvailability' || operation === 'bulkAvailability') {
						endpoint = operation === 'checkAvailability' ? '/accommodations/availability' : '/accommodations/availability/bulk';
						const hotelIds = this.getNodeParameter('hotelIds', i) as string;
						const checkinDate = this.getNodeParameter('checkinDate', i) as string;
						const checkoutDate = this.getNodeParameter('checkoutDate', i) as string;
						const adults = this.getNodeParameter('adults', i, 2) as number;

						requestBody = {
							...requestBody,
							hotel_ids: hotelIds.split(',').map(id => parseInt(id.trim())),
							checkin: checkinDate.split('T')[0],
							checkout: checkoutDate.split('T')[0],
							adults,
							...additionalOptions,
						};
					} else if (operation === 'getDetails') {
						endpoint = '/accommodations/details';
						const hotelIds = this.getNodeParameter('hotelIds', i) as string;
						requestBody = {
							...requestBody,
							hotel_ids: hotelIds.split(',').map(id => parseInt(id.trim())),
							...additionalOptions,
						};
					} else if (operation === 'getReviews') {
						endpoint = '/accommodations/reviews';
						const hotelIds = this.getNodeParameter('hotelIds', i) as string;
						requestBody = {
							...requestBody,
							hotel_ids: hotelIds.split(',').map(id => parseInt(id.trim())),
							...additionalOptions,
						};
					} else if (operation === 'getChains') {
						endpoint = '/accommodations/chains';
						requestBody = { ...requestBody, ...additionalOptions };
					} else if (operation === 'getConstants') {
						endpoint = '/accommodations/constants';
						requestBody = { ...requestBody, ...additionalOptions };
					}
				} else if (resource === 'locations') {
					if (operation === 'getCities') {
						endpoint = '/cities';
						const countryCode = this.getNodeParameter('countryCode', i, '') as string;
						if (countryCode) {
							requestBody.country = countryCode;
						}
					} else if (operation === 'getCountries') {
						endpoint = '/countries';
					} else if (operation === 'getAirports') {
						endpoint = '/airports';
						const countryCode = this.getNodeParameter('countryCode', i, '') as string;
						if (countryCode) {
							requestBody.country = countryCode;
						}
					} else if (operation === 'getLandmarks') {
						endpoint = '/landmarks';
					}
					requestBody = { ...requestBody, ...additionalOptions };
				} else if (resource === 'orders') {
					if (operation === 'createBooking') {
						endpoint = '/orders';
					} else if (operation === 'getOrderDetails') {
						endpoint = '/orders/details';
						const orderId = this.getNodeParameter('orderId', i) as string;
						requestBody.order_id = orderId;
					} else if (operation === 'cancelOrder') {
						endpoint = '/orders/cancel';
						const orderId = this.getNodeParameter('orderId', i) as string;
						requestBody.order_id = orderId;
					} else if (operation === 'modifyOrder') {
						endpoint = '/orders/modify';
						const orderId = this.getNodeParameter('orderId', i) as string;
						requestBody.order_id = orderId;
					}
					requestBody = { ...requestBody, ...additionalOptions };
				} else if (resource === 'payments') {
					if (operation === 'getPaymentMethods') {
						endpoint = '/payments/methods';
					} else if (operation === 'processPayment') {
						endpoint = '/payments/process';
					}
					requestBody = { ...requestBody, ...additionalOptions };
				}

				// Make API request
				const options: IHttpRequestOptions = {
					method: 'POST',
					url: baseURL + endpoint,
					body: requestBody,
					json: true,
					headers: {
						'Content-Type': 'application/json',
					},
				};

				try {
					responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'bookingComApi', options);
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `API request failed: ${error.message}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray([responseData]),
					{ itemData: { item: i } }
				);

				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					const errorItem = {
						json: { error: error.message },
						pairedItem: { item: i },
					};
					returnData.push(errorItem);
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
} 