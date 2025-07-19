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

**Purpose**: Test the complete request/response cycle with two modes:

**🔧 Mock Mode (Default)**:
- ✅ **Request format validation** with captured requests
- ✅ **Response handling** with realistic mock data
- ✅ **Authentication header** validation
- ✅ **Parameter formatting** verification
- ✅ **No real API calls** - no credentials required

**🌐 Real API Mode**:
- ✅ **Real API requests** to Booking.com sandbox
- ✅ **Response format validation** from actual API
- ✅ **Error handling** with real error responses
- ✅ **Complete authentication flow** testing

**No credentials required by default** - automatically uses mock mode when credentials are not provided.

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

Integration tests run in **mock mode by default** (no credentials needed).

### Quick Start (Mock Mode)

```bash
# Run integration tests with mock responses
npm run test:integration
# or  
node test-runner.js integration
```

**Mock mode tests**:
- ✅ Request format validation
- ✅ Response handling with realistic data
- ✅ Authentication headers
- ✅ Parameter conversion logic

### Real API Testing (Optional)

For testing against actual Booking.com sandbox API:

**1. Get Booking.com Sandbox Credentials**
1. Sign up at [Booking.com Partner Hub](https://partner.booking.com/)
2. Access your sandbox credentials
3. Get your Bearer Token and Affiliate ID

**2. Set Environment Variables**
```bash
export BOOKING_BEARER_TOKEN="your-sandbox-bearer-token"
export BOOKING_AFFILIATE_ID="your-affiliate-id"
```

**3. Run Real API Tests**
```bash
npm run test:integration  # Now uses real API mode
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

### Integration Tests (9 tests)

**Location Operations (2 tests)**
- ✅ Countries list API call (mock/real)
- ✅ Cities by country API call (mock/real)
- ✅ Response structure validation
- ✅ Request format validation

**Accommodation Operations (3 tests)**
- ✅ Hotel search with realistic parameters
- ✅ Accommodation constants request
- ✅ Accommodation details request
- ✅ Request body validation for each operation

**Request Format Validation (2 tests)**
- ✅ Date parameter formatting (ISO → YYYY-MM-DD)
- ✅ Hotel ID array conversion (string → array)

**Error Handling (1 test)**
- ✅ Invalid credentials error handling (real API only)
- ✅ Graceful error handling with continue-on-fail

**Authentication Validation (1 test)**
- ✅ Authentication headers validation
- ✅ Bearer token and Affiliate ID verification

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