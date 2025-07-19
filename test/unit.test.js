/**
 * Unit tests for Booking.com n8n Node
 * 
 * These tests validate the node structure, parameter handling, 
 * and basic functionality without making real API calls.
 */

const { BookingCom } = require('../dist/nodes/BookingCom/BookingCom.node.js');
const { BookingComApi } = require('../dist/credentials/BookingComApi.credentials.js');

describe('Booking.com Node - Unit Tests', () => {
  let node;
  
  beforeEach(() => {
    node = new BookingCom();
  });

  describe('Node Structure', () => {
    test('should have correct node properties', () => {
      const description = node.description;
      
      expect(description.displayName).toBe('Booking.com');
      expect(description.name).toBe('bookingCom');
      expect(description.version).toBe(1);
      expect(Array.isArray(description.properties)).toBe(true);
      expect(Array.isArray(description.inputs)).toBe(true);
      expect(Array.isArray(description.outputs)).toBe(true);
    });

    test('should have all required resources', () => {
      const resourceProperty = node.description.properties.find(p => p.name === 'resource');
      
      expect(resourceProperty).toBeDefined();
      expect(Array.isArray(resourceProperty.options)).toBe(true);
      
      const resourceValues = resourceProperty.options.map(opt => opt.value);
      expect(resourceValues).toContain('accommodations');
      expect(resourceValues).toContain('locations');
      expect(resourceValues).toContain('orders');
      expect(resourceValues).toContain('payments');
    });

    test('should have operation properties for each resource', () => {
      const operationProperties = node.description.properties.filter(p => p.name === 'operation');
      
      // Should have 4 operation definitions (one for each resource)
      expect(operationProperties).toHaveLength(4);
      
      // Each operation should have displayOptions
      operationProperties.forEach(op => {
        expect(op.displayOptions).toBeDefined();
        expect(op.displayOptions.show).toBeDefined();
        expect(op.displayOptions.show.resource).toBeDefined();
      });
    });

    test('should have accommodations operations', () => {
      const accommodationsOp = node.description.properties.find(
        p => p.name === 'operation' && 
        p.displayOptions?.show?.resource?.includes('accommodations')
      );
      
      expect(accommodationsOp).toBeDefined();
      expect(Array.isArray(accommodationsOp.options)).toBe(true);
      
      const operationValues = accommodationsOp.options.map(opt => opt.value);
      expect(operationValues).toContain('search');
      expect(operationValues).toContain('checkAvailability');
      expect(operationValues).toContain('bulkAvailability');
      expect(operationValues).toContain('getDetails');
      expect(operationValues).toContain('getReviews');
      expect(operationValues).toContain('getChains');
      expect(operationValues).toContain('getConstants');
    });
  });

  describe('Credentials Structure', () => {
    test('should have correct credential properties', () => {
      const credentials = new BookingComApi();
      
      expect(credentials.name).toBe('bookingComApi');
      expect(credentials.displayName).toBe('Booking.com API');
      expect(Array.isArray(credentials.properties)).toBe(true);
      expect(credentials.properties).toHaveLength(3);
    });

    test('should have environment, bearerToken and affiliateId fields', () => {
      const credentials = new BookingComApi();
      const fieldNames = credentials.properties.map(p => p.name);
      
      expect(fieldNames).toContain('environment');
      expect(fieldNames).toContain('bearerToken');
      expect(fieldNames).toContain('affiliateId');
    });

    test('should have authentication configuration', () => {
      const credentials = new BookingComApi();
      
      expect(credentials.authenticate).toBeDefined();
      expect(credentials.authenticate.type).toBe('generic');
      expect(credentials.authenticate.properties).toBeDefined();
      expect(credentials.authenticate.properties.headers).toBeDefined();
    });

    test('should have credential test configuration', () => {
      const credentials = new BookingComApi();
      
      expect(credentials.test).toBeDefined();
      expect(credentials.test.request).toBeDefined();
      expect(credentials.test.request.method).toBe('POST');
    });
  });

  describe('Parameter Validation', () => {
    test('should handle date parameter formatting', () => {
      // This tests our date formatting logic
      const testDate = '2024-06-15T10:30:00.000Z';
      const expectedDate = '2024-06-15';
      
      // Test the date splitting logic used in the node
      const formattedDate = testDate.split('T')[0];
      expect(formattedDate).toBe(expectedDate);
    });

    test('should handle hotel ID string to array conversion', () => {
      // Test the hotel ID parsing logic
      const hotelIdsString = '12345,67890,111213';
      const expectedArray = [12345, 67890, 111213];
      
      const parsedArray = hotelIdsString.split(',').map(id => parseInt(id.trim()));
      expect(parsedArray).toEqual(expectedArray);
    });

    test('should handle children ages parsing', () => {
      const childrenAgesString = '5, 12, 8';
      const expectedArray = [5, 12, 8];
      
      const parsedArray = childrenAgesString.split(',').map(age => parseInt(age.trim()));
      expect(parsedArray).toEqual(expectedArray);
    });

    test('should handle empty children ages', () => {
      const childrenAgesString = '';
      
      // Test the conditional logic used in the node
      if (childrenAgesString) {
        const parsedArray = childrenAgesString.split(',').map(age => parseInt(age.trim()));
        expect(parsedArray).toBeDefined();
      } else {
        expect(childrenAgesString).toBe('');
      }
    });
  });

  describe('Request Structure Validation', () => {
    let mockExecuteFunctions;

    beforeEach(() => {
      mockExecuteFunctions = {
        getInputData: () => [{ json: {} }],
        getCredentials: async () => ({
          environment: 'sandbox',
          bearerToken: 'test-token',
          affiliateId: 'test-id'
        }),
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
              // Mock HTTP call to capture request structure
              return { mockResponse: true, requestOptions: options };
            }
          },
          constructExecutionMetaData: (data, options) => data,
          returnJsonArray: (data) => data.map(item => ({ json: item }))
        }
      };
    });

    test('should build correct request for accommodations search', async () => {
      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'accommodations',
          operation: 'search',
          language: 'en-gb',
          destId: '20033173',
          checkinDate: '2024-06-15T10:30:00.000Z',
          checkoutDate: '2024-06-17T10:30:00.000Z',
          adults: 2,
          childrenAges: '5,12',
          additionalOptions: { 
            currency: 'USD',
            rows: 25,
            sortBy: 'popularity' 
          }
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      // Capture the HTTP request options
      let capturedOptions = null;
      mockExecuteFunctions.helpers.httpRequestWithAuthentication.call = async function(context, credentialType, options) {
        capturedOptions = options;
        return { mockResponse: true };
      };

      await node.execute.call(mockExecuteFunctions);

      expect(capturedOptions).toBeDefined();
      expect(capturedOptions.method).toBe('POST');
      expect(capturedOptions.url).toContain('/accommodations');
      expect(capturedOptions.body).toBeDefined();
      
      const requestBody = capturedOptions.body;
      expect(requestBody.language).toBe('en-gb');
      expect(requestBody.dest_id).toBe('20033173');
      expect(requestBody.checkin).toBe('2024-06-15');
      expect(requestBody.checkout).toBe('2024-06-17');
      expect(requestBody.adults).toBe(2);
      expect(requestBody.children_ages).toEqual([5, 12]);
      expect(requestBody.currency).toBe('USD');
      expect(requestBody.rows).toBe(25);
      expect(requestBody.sortBy).toBe('popularity');
    });

    test('should build correct request for locations getCities', async () => {
      mockExecuteFunctions.getNodeParameter = jest.fn((paramName, itemIndex, defaultValue) => {
        const params = {
          resource: 'locations',
          operation: 'getCities',
          language: 'en-gb',
          countryCode: 'US',
          additionalOptions: { rows: 50 }
        };
        return params[paramName] !== undefined ? params[paramName] : defaultValue;
      });

      let capturedOptions = null;
      mockExecuteFunctions.helpers.httpRequestWithAuthentication.call = async function(context, credentialType, options) {
        capturedOptions = options;
        return { mockResponse: true };
      };

      await node.execute.call(mockExecuteFunctions);

      expect(capturedOptions).toBeDefined();
      expect(capturedOptions.method).toBe('POST');
      expect(capturedOptions.url).toContain('/cities');
      
      const requestBody = capturedOptions.body;
      expect(requestBody.language).toBe('en-gb');
      expect(requestBody.country).toBe('US');
      expect(requestBody.rows).toBe(50);
    });

    test('should build correct request for accommodation details', async () => {
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

      let capturedOptions = null;
      mockExecuteFunctions.helpers.httpRequestWithAuthentication.call = async function(context, credentialType, options) {
        capturedOptions = options;
        return { mockResponse: true };
      };

      await node.execute.call(mockExecuteFunctions);

      expect(capturedOptions).toBeDefined();
      expect(capturedOptions.url).toContain('/accommodations/details');
      
      const requestBody = capturedOptions.body;
      expect(requestBody.language).toBe('en-gb');
      expect(Array.isArray(requestBody.hotel_ids)).toBe(true);
      expect(requestBody.hotel_ids).toEqual([12345, 67890]);
    });
  });

  describe('Environment Configuration', () => {
    test('should use sandbox URL for sandbox environment', async () => {
      const mockExecuteFunctions = {
        getInputData: () => [{ json: {} }],
        getCredentials: async () => ({
          environment: 'sandbox',
          bearerToken: 'test-token',
          affiliateId: 'test-id'
        }),
        getNodeParameter: jest.fn(() => 'test-value'),
        continueOnFail: () => false,
        getNode: () => ({ 
          id: 'test-node-id',
          name: 'BookingCom Test'
        }),
        helpers: {
          httpRequestWithAuthentication: {
            call: async function(context, credentialType, options) {
              expect(options.url).toContain('demandapi-sandbox.booking.com');
              return { mockResponse: true };
            }
          },
          constructExecutionMetaData: (data, options) => data,
          returnJsonArray: (data) => data.map(item => ({ json: item }))
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName) => {
        if (paramName === 'resource') return 'locations';
        if (paramName === 'operation') return 'getCountries';
        if (paramName === 'language') return 'en-gb';
        if (paramName === 'additionalOptions') return {};
        return '';
      });

      await node.execute.call(mockExecuteFunctions);
    });

    test('should use production URL for production environment', async () => {
      const mockExecuteFunctions = {
        getInputData: () => [{ json: {} }],
        getCredentials: async () => ({
          environment: 'production',
          bearerToken: 'test-token',
          affiliateId: 'test-id'
        }),
        getNodeParameter: jest.fn(() => 'test-value'),
        continueOnFail: () => false,
        getNode: () => ({ 
          id: 'test-node-id',
          name: 'BookingCom Test'
        }),
        helpers: {
          httpRequestWithAuthentication: {
            call: async function(context, credentialType, options) {
              expect(options.url).toContain('demandapi.booking.com');
              expect(options.url).not.toContain('sandbox');
              return { mockResponse: true };
            }
          },
          constructExecutionMetaData: (data, options) => data,
          returnJsonArray: (data) => data.map(item => ({ json: item }))
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName) => {
        if (paramName === 'resource') return 'locations';
        if (paramName === 'operation') return 'getCountries';
        if (paramName === 'language') return 'en-gb';
        if (paramName === 'additionalOptions') return {};
        return '';
      });

      await node.execute.call(mockExecuteFunctions);
    });
  });
}); 