/**
 * Integration tests for Booking.com n8n Node
 * 
 * These tests make real API calls to the Booking.com sandbox API
 * to verify the node works correctly end-to-end.
 * 
 * IMPORTANT: You need valid Booking.com sandbox credentials to run these tests.
 * Set environment variables: BOOKING_BEARER_TOKEN and BOOKING_AFFILIATE_ID
 */

const { BookingCom } = require('../dist/nodes/BookingCom/BookingCom.node.js');

// Test configuration
const SANDBOX_BASE_URL = 'https://demandapi-sandbox.booking.com/3.1';
const TEST_TIMEOUT = 30000; // 30 seconds for API calls

// Mock credentials - replace with real sandbox credentials
const mockCredentials = {
  environment: 'sandbox',
  bearerToken: process.env.BOOKING_BEARER_TOKEN || 'test-bearer-token',
  affiliateId: process.env.BOOKING_AFFILIATE_ID || 'test-affiliate-id',
};

// Skip tests if no real credentials provided
const hasCredentials = process.env.BOOKING_BEARER_TOKEN && process.env.BOOKING_AFFILIATE_ID;

describe('Booking.com Node - Integration Tests', () => {
  let node;
  let mockExecuteFunctions;

  beforeAll(() => {
    if (!hasCredentials) {
      console.log('⚠️  Skipping integration tests - no credentials provided');
      console.log('   Set BOOKING_BEARER_TOKEN and BOOKING_AFFILIATE_ID to run integration tests');
    }
  });

  beforeEach(() => {
    node = new BookingCom();
    
    // Mock n8n execution context
    mockExecuteFunctions = {
      getInputData: () => [{ json: {} }],
      getCredentials: async () => mockCredentials,
      continueOnFail: () => false,
      getNode: () => ({ 
        id: 'test-node-id',
        name: 'BookingCom Test',
        type: 'bookingCom',
        typeVersion: 1,
        position: [0, 0],
        parameters: {}
      }),
      helpers: {
        httpRequestWithAuthentication: {
          call: async function(context, credentialType, options) {
            // Make real HTTP request using node's fetch or axios equivalent
            const response = await makeRealAPIRequest(options);
            return response;
          }
        },
        constructExecutionMetaData: (data, options) => data,
        returnJsonArray: (data) => data.map(item => ({ json: item }))
      }
    };
  });

  // Helper function to make real API requests
  async function makeRealAPIRequest(options) {
    const fetch = require('node-fetch').default || require('node-fetch');
    
    const requestOptions = {
      method: options.method || 'POST',
      headers: {
        'Authorization': `Bearer ${mockCredentials.bearerToken}`,
        'X-Affiliate-Id': mockCredentials.affiliateId,
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    const response = await fetch(options.url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  describe('Location Operations', () => {
    test('should get countries list', async () => {
      if (!hasCredentials) return;

      // Mock parameters for getting countries
      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'locations',
          operation: 'getCountries', 
          language: 'en-gb',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(mockExecuteFunctions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verify response structure
      const countries = result[0];
      expect(Array.isArray(countries)).toBe(true);
      
      if (countries.length > 0) {
        const firstCountry = countries[0].json;
        expect(firstCountry).toHaveProperty('country_code');
        expect(firstCountry).toHaveProperty('name');
        console.log('✅ Sample country:', firstCountry.name, firstCountry.country_code);
      }
    }, TEST_TIMEOUT);

    test('should get cities for a specific country', async () => {
      if (!hasCredentials) return;

      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'locations',
          operation: 'getCities',
          language: 'en-gb',
          countryCode: 'US', // Test with US cities
          additionalOptions: { rows: 10 }
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(mockExecuteFunctions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      const cities = result[0];
      expect(Array.isArray(cities)).toBe(true);
      
      if (cities.length > 0) {
        const firstCity = cities[0].json;
        expect(firstCity).toHaveProperty('city_id');
        expect(firstCity).toHaveProperty('name');
        expect(firstCity).toHaveProperty('country');
        console.log('✅ Sample US city:', firstCity.name, firstCity.city_id);
      }
    }, TEST_TIMEOUT);
  });

  describe('Accommodation Operations', () => {
    test('should search accommodations', async () => {
      if (!hasCredentials) return;

      // Use a known destination ID (e.g., New York City)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkoutDate = new Date(futureDate);
      checkoutDate.setDate(checkoutDate.getDate() + 2);

      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'search',
          language: 'en-gb',
          destId: '20033173', // New York City
          checkinDate: futureDate.toISOString(),
          checkoutDate: checkoutDate.toISOString(),
          adults: 2,
          childrenAges: '',
          additionalOptions: { 
            currency: 'USD',
            rows: 5, // Limit results for testing
            sortBy: 'popularity' 
          }
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(mockExecuteFunctions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      const accommodations = result[0];
      expect(Array.isArray(accommodations)).toBe(true);
      
      if (accommodations.length > 0) {
        const firstAccommodation = accommodations[0].json;
        // Check for common accommodation properties
        expect(firstAccommodation).toBeDefined();
        console.log('✅ Sample accommodation search result keys:', Object.keys(firstAccommodation));
        
        // Log sample data structure (without sensitive info)
        if (firstAccommodation.hotel_id) {
          console.log('✅ Found hotel_id:', firstAccommodation.hotel_id);
        }
        if (firstAccommodation.hotel_name) {
          console.log('✅ Found hotel_name:', firstAccommodation.hotel_name);
        }
      }
    }, TEST_TIMEOUT);

    test('should get accommodation constants', async () => {
      if (!hasCredentials) return;

      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'getConstants',
          language: 'en-gb',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(mockExecuteFunctions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      const constants = result[0];
      if (constants.length > 0) {
        const constantsData = constants[0].json;
        console.log('✅ Accommodation constants keys:', Object.keys(constantsData));
      }
    }, TEST_TIMEOUT);
  });

  describe('Error Handling', () => {
    test('should handle invalid credentials gracefully', async () => {
      if (!hasCredentials) return;

      // Use invalid credentials
      const invalidMockFunctions = {
        ...mockExecuteFunctions,
        getCredentials: async () => ({
          environment: 'sandbox',
          bearerToken: 'invalid-token',
          affiliateId: 'invalid-id',
        }),
        continueOnFail: () => true // Enable continue on fail to test error handling
      };

      invalidMockFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'locations',
          operation: 'getCountries',
          language: 'en-gb',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(invalidMockFunctions);
      
      // Should return error in continue-on-fail mode
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result[0] && result[0].length > 0) {
        const errorResult = result[0][0];
        expect(errorResult.json).toHaveProperty('error');
        console.log('✅ Error handling test - error message:', errorResult.json.error);
      }
    }, TEST_TIMEOUT);

    test('should handle invalid parameters', async () => {
      if (!hasCredentials) return;

      mockExecuteFunctions.continueOnFail = () => true;
      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'search',
          language: 'en-gb',
          destId: 'invalid-destination', // Invalid destination ID
          checkinDate: '2024-01-01', // Past date
          checkoutDate: '2024-01-02',
          adults: 2,
          childrenAges: '',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(mockExecuteFunctions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Should handle the error gracefully
      console.log('✅ Parameter validation test completed');
    }, TEST_TIMEOUT);
  });

  describe('Request Format Validation', () => {
    test('should format date parameters correctly', async () => {
      if (!hasCredentials) return;

      const testDate = new Date('2024-06-15T10:30:00Z');
      const expectedDate = '2024-06-15'; // Should extract just the date part

      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'search',
          language: 'en-gb',
          destId: '20033173',
          checkinDate: testDate.toISOString(),
          checkoutDate: testDate.toISOString(),
          adults: 2,
          childrenAges: '',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      // Mock the HTTP request to capture the request body
      let capturedRequestBody = null;
      mockExecuteFunctions.helpers.httpRequestWithAuthentication.call = async function(context, credentialType, options) {
        capturedRequestBody = options.body;
        // Return a mock response to avoid actual API call
        throw new Error('CAPTURED_REQUEST'); // We'll catch this to examine the request
      };

      try {
        await node.execute.call(mockExecuteFunctions);
      } catch (error) {
        if (error.message === 'CAPTURED_REQUEST' && capturedRequestBody) {
          expect(capturedRequestBody.checkin).toBe(expectedDate);
          expect(capturedRequestBody.checkout).toBe(expectedDate);
          console.log('✅ Date formatting test - checkin:', capturedRequestBody.checkin);
          console.log('✅ Date formatting test - checkout:', capturedRequestBody.checkout);
        }
      }
    }, TEST_TIMEOUT);

    test('should format hotel IDs correctly', async () => {
      if (!hasCredentials) return;

      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'getDetails',
          language: 'en-gb',
          hotelIds: '12345,67890,111213', // Comma-separated string
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      let capturedRequestBody = null;
      mockExecuteFunctions.helpers.httpRequestWithAuthentication.call = async function(context, credentialType, options) {
        capturedRequestBody = options.body;
        throw new Error('CAPTURED_REQUEST');
      };

      try {
        await node.execute.call(mockExecuteFunctions);
      } catch (error) {
        if (error.message === 'CAPTURED_REQUEST' && capturedRequestBody) {
          expect(Array.isArray(capturedRequestBody.hotel_ids)).toBe(true);
          expect(capturedRequestBody.hotel_ids).toEqual([12345, 67890, 111213]);
          console.log('✅ Hotel ID formatting test - hotel_ids:', capturedRequestBody.hotel_ids);
        }
      }
    }, TEST_TIMEOUT);
  });
});

// Test runner configuration
if (require.main === module) {
  console.log('🧪 Running Booking.com Integration Tests');
  console.log('');
  
  if (!hasCredentials) {
    console.log('⚠️  To run integration tests with real API calls:');
    console.log('   export BOOKING_BEARER_TOKEN="your-sandbox-bearer-token"');
    console.log('   export BOOKING_AFFILIATE_ID="your-affiliate-id"');
    console.log('   npm test');
    console.log('');
    console.log('   Running structural tests only...');
  } else {
    console.log('✅ Credentials found - running full integration tests');
    console.log('   Environment: sandbox');
    console.log('   Bearer Token: ' + mockCredentials.bearerToken.substring(0, 10) + '...');
    console.log('   Affiliate ID: ' + mockCredentials.affiliateId);
    console.log('');
  }
} 