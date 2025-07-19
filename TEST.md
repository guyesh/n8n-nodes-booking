# Booking.com n8n Node - Testing Guide

This guide explains the comprehensive testing suite for the Booking.com n8n node, including sanity tests that verify actual API requests and responses.

## 🧪 Test Types

### 1. Unit Tests (`test/unit.test.js`)

**Purpose**: Validate node structure, parameter handling, and request formatting **without** making real API calls.

**What it tests**:
- ✅ Node structure and properties
- ✅ Credential configuration  
- ✅ Parameter validation and formatting
- ✅ Request body construction
- ✅ URL routing (sandbox vs production)
- ✅ Data type conversions (dates, arrays, etc.)

**No credentials required** - these tests use mocks.

### 2. Integration Tests (`test/integration.test.js`)

**Purpose**: Make **real API calls** to Booking.com sandbox to verify end-to-end functionality.

**What it tests**:
- ✅ **Real API requests** with proper authentication
- ✅ **Response format validation** from Booking.com
- ✅ **Error handling** with real error responses
- ✅ **Parameter formatting** in actual requests
- ✅ **Authentication flow** with Bearer tokens
- ✅ **Different operations** (locations, accommodations, etc.)

**Requires real credentials** - uses sandbox environment.

## 🚀 Running Tests

### Quick Test Commands

```bash
# Unit tests only (no API calls)
npm run test:unit

# Integration tests (requires credentials)  
npm run test:integration

# All tests
npm test

# Build validation
npm run build && npm run lint
```

### Using the Test Runner

```bash
# Unit tests
node test-runner.js unit

# Integration tests (with credentials)
export BOOKING_BEARER_TOKEN="your-sandbox-token"
export BOOKING_AFFILIATE_ID="your-affiliate-id"
node test-runner.js integration

# All tests
node test-runner.js all

# Build validation
node test-runner.js build

# Help
node test-runner.js
```

## 🔐 Setting Up Integration Tests

To run integration tests that make real API calls:

### 1. Get Booking.com Sandbox Credentials

1. Sign up at [Booking.com Partner Hub](https://partner.booking.com/)
2. Access your sandbox credentials
3. Get your Bearer Token and Affiliate ID

### 2. Set Environment Variables

```bash
export BOOKING_BEARER_TOKEN="your-sandbox-bearer-token"
export BOOKING_AFFILIATE_ID="your-affiliate-id"
```

### 3. Run Integration Tests

```bash
npm run test:integration
# or
node test-runner.js integration
```

## 📋 Test Coverage

### Unit Tests (17 tests)

**Node Structure (4 tests)**
- Node properties validation
- Resource definitions  
- Operation properties
- Accommodations operations

**Credentials Structure (4 tests)**
- Credential properties
- Required fields validation
- Authentication configuration
- Test configuration

**Parameter Validation (4 tests)**
- Date formatting (ISO → YYYY-MM-DD)
- Hotel ID parsing (string → array)
- Children ages parsing
- Empty value handling

**Request Structure Validation (3 tests)**
- Accommodations search request building
- Locations getCities request building  
- Accommodation details request building

**Environment Configuration (2 tests)**
- Sandbox URL validation
- Production URL validation

### Integration Tests (8 tests)

**Location Operations (2 tests)**
- ✅ Real API call to get countries list
- ✅ Real API call to get cities by country
- ✅ Response structure validation
- ✅ Data property verification

**Accommodation Operations (2 tests)**
- ✅ Real hotel search with future dates
- ✅ Real accommodation constants request
- ✅ Response data structure validation

**Error Handling (2 tests)**
- ✅ Invalid credentials error handling
- ✅ Invalid parameters error handling
- ✅ Continue-on-fail functionality

**Request Format Validation (2 tests)**
- ✅ Date parameter formatting verification
- ✅ Hotel ID array conversion verification

## 🔍 Sanity Test Examples

### API Request Validation

The integration tests capture and verify actual request structures:

```javascript
// Verifies this request structure is sent to Booking.com:
{
  "language": "en-gb",
  "dest_id": "20033173",
  "checkin": "2024-06-15",      // ✅ Properly formatted
  "checkout": "2024-06-17", 
  "adults": 2,
  "children_ages": [5, 12],     // ✅ Converted from string
  "currency": "USD",
  "rows": 25
}
```

### API Response Validation

Tests verify real API responses have expected structure:

```javascript
// Countries API response validation
expect(response[0].json).toHaveProperty('country_code');
expect(response[0].json).toHaveProperty('name');

// Accommodations API response validation  
expect(response[0].json).toHaveProperty('hotel_id');
expect(response[0].json).toHaveProperty('hotel_name');
```

### Error Response Testing

Tests validate error handling with real API error responses:

```javascript
// Tests actual 401/403/400 responses from API
expect(errorResult.json).toHaveProperty('error');
console.log('Error message:', errorResult.json.error);
```

## 📊 Test Results Example

```bash
🧪 Booking.com n8n Node Test Runner
=====================================

✅ Unit tests completed successfully

Test Suites: 1 passed, 1 total  
Tests: 17 passed, 17 total
- Node Structure: 4/4 ✅
- Credentials: 4/4 ✅  
- Parameter Validation: 4/4 ✅
- Request Building: 3/3 ✅
- Environment Config: 2/2 ✅

🎉 All sanity checks passed!
```

## 🐛 Debugging Failed Tests

### Unit Test Failures

```bash
# Check node structure
npm run test:unit -- --testNamePattern="Node Structure"

# Check parameter handling  
npm run test:unit -- --testNamePattern="Parameter Validation"
```

### Integration Test Failures

```bash
# Test with debug output
DEBUG=* npm run test:integration

# Test single operation
npm run test:integration -- --testNamePattern="get countries"
```

### Common Issues

**"Cannot find module" errors**
- Run `npm run build` first
- Ensure all dependencies installed: `npm install`

**Integration test auth failures**
- Verify credentials are correct
- Check environment variables: `echo $BOOKING_BEARER_TOKEN`  
- Ensure using sandbox credentials

**Request format errors**  
- Check parameter validation in unit tests
- Verify request body structure in integration tests

## 🎯 Test Philosophy

**Why These Tests Matter**:

1. **Unit Tests** ensure the node is correctly structured and handles parameters properly
2. **Integration Tests** verify the node actually works with the real Booking.com API
3. **Sanity Tests** catch breaking changes in API request/response formats
4. **Error Tests** ensure graceful failure handling

**What We Test**:
- ✅ Request formatting matches Booking.com API expectations
- ✅ Response parsing handles real API data correctly  
- ✅ Authentication works with real credentials
- ✅ Error scenarios are handled gracefully
- ✅ All node operations function end-to-end

This ensures the node works reliably in production n8n environments! 🚀 