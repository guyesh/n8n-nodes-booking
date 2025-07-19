/**
 * Integration tests for Booking.com n8n Node
 * 
 * These tests validate the complete request/response cycle.
 * 
 * MODES:
 * 1. MOCK MODE (default): Uses mock responses, no credentials required
 * 2. REAL API MODE: Makes actual API calls with real credentials
 * 
 * Set BOOKING_BEARER_TOKEN and BOOKING_AFFILIATE_ID for real API mode
 */

const { BookingCom } = require('../dist/nodes/BookingCom/BookingCom.node.js');

// Test configuration
const SANDBOX_BASE_URL = 'https://demandapi-sandbox.booking.com/3.1';
const TEST_TIMEOUT = 30000; // 30 seconds for API calls

// Mock credentials for testing
const mockCredentials = {
  environment: 'sandbox',
  bearerToken: process.env.BOOKING_BEARER_TOKEN || 'mock-bearer-token',
  affiliateId: process.env.BOOKING_AFFILIATE_ID || 'mock-affiliate-id',
};

// Check if real credentials are provided
const hasRealCredentials = process.env.BOOKING_BEARER_TOKEN && process.env.BOOKING_AFFILIATE_ID;
const useMockMode = !hasRealCredentials;

// Mock API responses that match real Booking.com API format
const mockApiResponses = {
  '/countries': [
    {
      country_code: 'US',
      name: 'United States',
      currency: 'USD'
    },
    {
      country_code: 'GB', 
      name: 'United Kingdom',
      currency: 'GBP'
    },
    {
      country_code: 'FR',
      name: 'France', 
      currency: 'EUR'
    }
  ],
  '/cities': [
    {
      city_id: 20033173,
      name: 'New York',
      country: 'United States',
      region: 'New York State',
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      city_id: 20024809,
      name: 'Los Angeles',
      country: 'United States', 
      region: 'California',
      latitude: 34.0522,
      longitude: -118.2437
    }
  ],
  '/accommodations': [
    {
      hotel_id: 12345,
      hotel_name: 'Test Hotel NYC',
      city: 'New York',
      country: 'United States',
      rating: 4.2,
      review_score: 8.5,
      price: {
        currency: 'USD',
        amount: 299.00
      },
      availability: true
    },
    {
      hotel_id: 67890,
      hotel_name: 'Sample Resort',
      city: 'Miami',
      country: 'United States',
      rating: 4.8,
      review_score: 9.1,
      price: {
        currency: 'USD',
        amount: 450.00
      },
      availability: true
    }
  ],
  '/accommodations/constants': {
    currencies: ['USD', 'EUR', 'GBP', 'JPY'],
    languages: ['en-gb', 'en-us', 'es', 'fr', 'de'],
    hotel_types: ['hotel', 'apartment', 'resort', 'hostel'],
    amenities: ['wifi', 'parking', 'pool', 'gym', 'spa']
  },
  '/accommodations/details': [
    {
      hotel_id: 12345,
      hotel_name: 'Test Hotel NYC',
      description: 'A modern hotel in the heart of Manhattan',
      address: '123 Broadway, New York, NY 10001',
      facilities: ['wifi', 'gym', 'restaurant'],
      photos: [
        { url: 'https://example.com/photo1.jpg', description: 'Exterior view' }
      ],
      rooms: [
        {
          room_id: 'standard',
          name: 'Standard Room',
          max_occupancy: 2,
          bed_type: 'double'
        }
      ]
    }
  ]
};

describe('Booking.com Node - Integration Tests', () => {
  let node;
  let mockExecuteFunctions;
  let capturedRequests = [];

  beforeAll(() => {
    if (useMockMode) {
      console.log('🔧 Running in MOCK MODE (no credentials required)');
      console.log('   - Tests request format and response handling');
      console.log('   - Uses realistic mock API responses');
      console.log('   - No real API calls made');
      console.log('\n   💡 For real API testing, set:');
      console.log('   export BOOKING_BEARER_TOKEN="your-sandbox-token"');
      console.log('   export BOOKING_AFFILIATE_ID="your-affiliate-id"\n');
    } else {
      console.log('🌐 Running in REAL API MODE');
      console.log('   - Makes actual API calls to Booking.com sandbox');
      console.log('   - Validates real API responses\n');
    }
  });

  beforeEach(() => {
    node = new BookingCom();
    capturedRequests = [];
    
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
            if (useMockMode) {
              return mockApiRequest(options);
            } else {
              return realApiRequest(options);
            }
          }
        },
        constructExecutionMetaData: (data, options) => data,
        returnJsonArray: (data) => data.map(item => ({ json: item }))
      }
    };
  });

  // Mock API request handler
  async function mockApiRequest(options) {
    // Simulate the headers that would be added by n8n's authentication system
    const mockHeaders = {
      'Authorization': `Bearer ${mockCredentials.bearerToken}`,
      'X-Affiliate-Id': mockCredentials.affiliateId,
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Capture request for validation
    capturedRequests.push({
      method: options.method,
      url: options.url,
      headers: mockHeaders,
      body: options.body
    });

    // Validate request structure
    expect(options.method).toBe('POST');
    expect(options.url).toContain('demandapi-sandbox.booking.com');

    // Determine which mock response to return based on URL
    if (options.url.includes('/countries')) {
      return mockApiResponses['/countries'];
    } else if (options.url.includes('/cities')) {
      return mockApiResponses['/cities'];
    } else if (options.url.includes('/accommodations/constants')) {
      return mockApiResponses['/accommodations/constants'];
    } else if (options.url.includes('/accommodations/details')) {
      return mockApiResponses['/accommodations/details'];
    } else if (options.url.includes('/accommodations')) {
      return mockApiResponses['/accommodations'];
    } else {
      throw new Error(`Mock response not defined for URL: ${options.url}`);
    }
  }

  // Real API request handler (unchanged)
  async function realApiRequest(options) {
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
      
      // Handle the nested structure: result[0][0].json contains the actual data
      const countries = result[0][0].json;  // The actual countries array
      expect(Array.isArray(countries)).toBe(true);
      
      if (countries.length > 0) {
        const firstCountry = countries[0];
        expect(firstCountry).toHaveProperty('country_code');
        expect(firstCountry).toHaveProperty('name');
        console.log('✅ Sample country:', firstCountry.name, firstCountry.country_code);
      }

      // Verify request structure (works in both mock and real mode)
      if (useMockMode && capturedRequests.length > 0) {
        const request = capturedRequests[0];
        expect(request.url).toContain('/countries');
        expect(request.body).toHaveProperty('language', 'en-gb');
        console.log('✅ Request validation passed');
      }
    }, TEST_TIMEOUT);

    test('should get cities for a specific country', async () => {
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
      
      const cities = result[0][0].json;  // The actual cities array
      expect(Array.isArray(cities)).toBe(true);
      
      if (cities.length > 0) {
        const firstCity = cities[0];
        expect(firstCity).toHaveProperty('city_id');
        expect(firstCity).toHaveProperty('name');
        expect(firstCity).toHaveProperty('country');
        console.log('✅ Sample city:', firstCity.name, firstCity.city_id);
      }

      // Verify request format
      if (useMockMode && capturedRequests.length > 0) {
        const request = capturedRequests[capturedRequests.length - 1];
        expect(request.url).toContain('/cities');
        expect(request.body).toHaveProperty('language', 'en-gb');
        expect(request.body).toHaveProperty('country', 'US');
        expect(request.body).toHaveProperty('rows', 10);
        console.log('✅ Cities request validation passed');
      }
    }, TEST_TIMEOUT);
  });

  describe('Accommodation Operations', () => {
    test('should search accommodations', async () => {
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
          childrenAges: '5,12',
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
      
      const accommodations = result[0][0].json;  // The actual accommodations array
      expect(Array.isArray(accommodations)).toBe(true);
      
      if (accommodations.length > 0) {
        const firstAccommodation = accommodations[0];
        expect(firstAccommodation).toBeDefined();
        console.log('✅ Sample accommodation keys:', Object.keys(firstAccommodation));
        
        if (firstAccommodation.hotel_id) {
          console.log('✅ Found hotel_id:', firstAccommodation.hotel_id);
        }
        if (firstAccommodation.hotel_name) {
          console.log('✅ Found hotel_name:', firstAccommodation.hotel_name);
        }
      }

      // Verify request format
      if (useMockMode && capturedRequests.length > 0) {
        const request = capturedRequests[capturedRequests.length - 1];
        expect(request.url).toContain('/accommodations');
        expect(request.body).toHaveProperty('language', 'en-gb');
        expect(request.body).toHaveProperty('dest_id', '20033173');
        expect(request.body).toHaveProperty('checkin');
        expect(request.body).toHaveProperty('checkout');
        expect(request.body).toHaveProperty('adults', 2);
        expect(request.body).toHaveProperty('children_ages', [5, 12]);
        expect(request.body).toHaveProperty('currency', 'USD');
        console.log('✅ Accommodation search request validation passed');
      }
    }, TEST_TIMEOUT);

    test('should get accommodation constants', async () => {
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
      
      const constantsData = result[0][0].json;  // The actual constants object
      console.log('✅ Accommodation constants keys:', Object.keys(constantsData));
      
      if (useMockMode) {
        expect(constantsData).toHaveProperty('currencies');
        expect(constantsData).toHaveProperty('languages');
        expect(Array.isArray(constantsData.currencies)).toBe(true);
      }
    }, TEST_TIMEOUT);

    test('should get accommodation details', async () => {
      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'getDetails',
          language: 'en-gb',
          hotelIds: '12345,67890',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      const result = await node.execute.call(mockExecuteFunctions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Verify request format
      if (useMockMode && capturedRequests.length > 0) {
        const request = capturedRequests[capturedRequests.length - 1];
        expect(request.url).toContain('/accommodations/details');
        expect(request.body).toHaveProperty('language', 'en-gb');
        expect(request.body).toHaveProperty('hotel_ids', [12345, 67890]);
        console.log('✅ Hotel details request validation passed');
      }
    }, TEST_TIMEOUT);
  });

  describe('Request Format Validation', () => {
    test('should format date parameters correctly', async () => {
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

      await node.execute.call(mockExecuteFunctions);

      // Verify date formatting in captured request
      if (capturedRequests.length > 0) {
        const request = capturedRequests[capturedRequests.length - 1];
        expect(request.body.checkin).toBe(expectedDate);
        expect(request.body.checkout).toBe(expectedDate);
        console.log('✅ Date formatting test - checkin:', request.body.checkin);
        console.log('✅ Date formatting test - checkout:', request.body.checkout);
      }
    }, TEST_TIMEOUT);

    test('should format hotel IDs correctly', async () => {
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

      await node.execute.call(mockExecuteFunctions);

      // Verify hotel ID formatting in captured request
      if (capturedRequests.length > 0) {
        const request = capturedRequests[capturedRequests.length - 1];
        expect(Array.isArray(request.body.hotel_ids)).toBe(true);
        expect(request.body.hotel_ids).toEqual([12345, 67890, 111213]);
        console.log('✅ Hotel ID formatting test - hotel_ids:', request.body.hotel_ids);
      }
    }, TEST_TIMEOUT);
  });

  describe('Error Handling', () => {
    test('should handle invalid credentials gracefully', async () => {
      if (!useMockMode) {
        // Only test with real API calls
        const invalidMockFunctions = {
          ...mockExecuteFunctions,
          getCredentials: async () => ({
            environment: 'sandbox',
            bearerToken: 'invalid-token',
            affiliateId: 'invalid-id',
          }),
          continueOnFail: () => true
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
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        
        if (result[0] && result[0].length > 0) {
          const errorResult = result[0][0];
          expect(errorResult.json).toHaveProperty('error');
          console.log('✅ Error handling test - error message:', errorResult.json.error);
        }
      } else {
        console.log('⏭️  Skipping error handling test in mock mode');
      }
    }, TEST_TIMEOUT);
  });

  describe('Authentication Headers', () => {
    test('should include correct authentication headers', async () => {
      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'locations',
          operation: 'getCountries',
          language: 'en-gb',
          additionalOptions: {}
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      await node.execute.call(mockExecuteFunctions);

      if (capturedRequests.length > 0) {
        const request = capturedRequests[capturedRequests.length - 1];
        expect(request.headers).toHaveProperty('Authorization');
        expect(request.headers).toHaveProperty('X-Affiliate-Id');
        expect(request.headers['Content-Type']).toBe('application/json');
        
        if (useMockMode) {
          expect(request.headers['Authorization']).toBe('Bearer mock-bearer-token');
          expect(request.headers['X-Affiliate-Id']).toBe('mock-affiliate-id');
        }
        
        console.log('✅ Authentication headers validation passed');
      }
    }, TEST_TIMEOUT);
  });
});

// Test runner configuration
if (require.main === module) {
  console.log('🧪 Running Booking.com Integration Tests');
  console.log('');
  
  if (useMockMode) {
    console.log('🔧 MOCK MODE - No credentials required');
    console.log('   ✅ Tests request format validation');
    console.log('   ✅ Tests response handling with realistic mock data');
    console.log('   ✅ No real API calls made');
    console.log('');
    console.log('   💡 To test with real API:');
    console.log('   export BOOKING_BEARER_TOKEN="your-sandbox-token"');
    console.log('   export BOOKING_AFFILIATE_ID="your-affiliate-id"');
  } else {
    console.log('🌐 REAL API MODE');
    console.log('   ✅ Makes actual calls to Booking.com sandbox');
    console.log('   Environment: sandbox');
    console.log('   Bearer Token: ' + mockCredentials.bearerToken.substring(0, 10) + '...');
    console.log('   Affiliate ID: ' + mockCredentials.affiliateId);
  }
  console.log('');
} 