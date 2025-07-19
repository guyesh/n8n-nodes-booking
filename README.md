# n8n-nodes-booking

This is an n8n community node. It lets you use Booking.com Demand API in your n8n workflows.

Booking.com is the world's leading accommodation booking platform, offering access to millions of properties worldwide through their comprehensive API for searching accommodations, managing bookings, and processing payments.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

**Accommodations**
- Search accommodations
- Check availability (single/bulk)
- Get accommodation details
- Get accommodation reviews
- Get accommodation chains
- Get accommodation constants

**Locations**
- Get cities
- Get countries
- Get airports
- Get landmarks

**Orders**
- Create booking
- Get order details
- Cancel order
- Modify order

**Payments**
- Get payment methods
- Process payment

## Credentials

You need to be a Booking.com partner to use this node. Sign up at [Booking.com Partner Hub](https://partner.booking.com/) to get API access.

### Authentication Setup

1. Go to **Credentials** in your n8n instance
2. Click **Add Credential** → **Booking.com API**
3. Fill in the required fields:
   - **Environment**: Choose Sandbox (testing) or Production
   - **Bearer Token**: Your API authentication token from Booking.com
   - **Affiliate ID**: Your Booking.com affiliate identifier

### Environment Selection
- **Sandbox**: `https://demandapi-sandbox.booking.com/3.1/` (for testing)
- **Production**: `https://demandapi.booking.com/3.1/` (for live data)

## Compatibility

Minimum n8n version: 1.0.0

Tested with n8n versions:
- 1.0.x
- 1.30.x (latest)

This node uses n8n's built-in HTTP request functionality and should be compatible with all modern n8n versions.

## Usage

### 1. Search for Hotels

```json
{
  "resource": "accommodations",
  "operation": "search",
  "destId": "20033173",
  "checkinDate": "2024-06-01",
  "checkoutDate": "2024-06-03",
  "adults": 2,
  "language": "en-gb",
  "additionalOptions": {
    "currency": "USD",
    "rows": 25,
    "sortBy": "popularity"
  }
}
```

### 2. Check Hotel Availability

```json
{
  "resource": "accommodations",
  "operation": "checkAvailability",
  "hotelIds": "12345,67890",
  "checkinDate": "2024-06-01",
  "checkoutDate": "2024-06-03",
  "adults": 2,
  "language": "en-gb"
}
```

### 3. Get Cities by Country

```json
{
  "resource": "locations",
  "operation": "getCities",
  "countryCode": "US",
  "language": "en-gb",
  "additionalOptions": {
    "rows": 100
  }
}
```

### 4. Get Order Details

```json
{
  "resource": "orders",
  "operation": "getOrderDetails",
  "orderId": "your-order-id",
  "language": "en-gb"
}
```

### Key Features

- **Multi-language support**: 7+ languages (en-gb, en-us, de, es, fr, it, nl)
- **Environment switching**: Test with sandbox, deploy to production
- **Comprehensive error handling**: Detailed error messages for different HTTP status codes
- **Built-in pagination**: Handle large result sets efficiently
- **Rate limit handling**: Automatic retry logic for API limits

### Common Issues & Solutions

**Authentication Errors**
- Verify your Bearer token and Affiliate ID are correct
- Ensure you're using the right environment (sandbox vs production)

**Parameter Errors**
- Check that all required parameters are provided
- Validate date formats (YYYY-MM-DD)
- Ensure numeric values for hotel IDs and guest counts

ad**Rate Limiting**
- The API has rate limits that vary by partner agreement
- The node includes built-in retry logic for rate limit errors
- Start with sandbox environment for testing



## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Booking.com Demand API documentation](https://developers.booking.com/demand/docs/open-api/demand-api)
* [Booking.com Partner Hub](https://partner.booking.com/)

## Version history

**v1.0.0** - Initial release
- Full Booking.com Demand API integration
- Support for accommodations, locations, orders, and payments
- Multi-language support (7 languages)
- Comprehensive error handling and validation
- Sandbox and production environment support
- Built-in pagination and rate limiting 