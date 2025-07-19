import { NodeOperationError } from 'n8n-workflow';

export interface BookingApiError {
  error_code?: string;
  error_message?: string;
  message?: string;
  status?: number;
}

export class BookingErrorHandler {
  static handleApiError(error: any, node: any, itemIndex?: number): NodeOperationError {
    let errorMessage = 'Unknown API error occurred';
    let description = '';

    // Handle different error formats
    if (error.response?.data) {
      const apiError = error.response.data as BookingApiError;
      
      if (apiError.error_message) {
        errorMessage = apiError.error_message;
        description = `Error Code: ${apiError.error_code || 'Unknown'}`;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific HTTP status codes
    if (error.response?.status) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          description = 'Bad Request - Check your parameters';
          break;
        case 401:
          description = 'Unauthorized - Check your credentials';
          break;
        case 403:
          description = 'Forbidden - Insufficient permissions';
          break;
        case 404:
          description = 'Not Found - Resource does not exist';
          break;
        case 429:
          description = 'Rate Limited - Too many requests';
          break;
        case 500:
          description = 'Internal Server Error - Try again later';
          break;
        default:
          description = `HTTP ${status} Error`;
      }
    }

    const fullMessage = description ? `${errorMessage} (${description})` : errorMessage;

    return new NodeOperationError(node, fullMessage, {
      itemIndex: itemIndex,
      description: 'Booking.com API Error',
    });
  }

  static validateRequiredFields(
    fields: Record<string, any>,
    requiredFields: string[]
  ): string[] {
    const missing: string[] = [];
    
    for (const field of requiredFields) {
      if (!fields[field] || (typeof fields[field] === 'string' && fields[field].trim() === '')) {
        missing.push(field);
      }
    }
    
    return missing;
  }

  static formatValidationError(missingFields: string[]): string {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
} 