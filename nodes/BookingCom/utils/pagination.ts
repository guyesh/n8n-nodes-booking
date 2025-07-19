import { IDataObject } from 'n8n-workflow';

export interface PaginationOptions {
  maxResults?: number;
  offset?: number;
  rows?: number;
}

export interface PaginatedResponse {
  data: IDataObject[];
  hasMore: boolean;
  nextOffset: number;
  totalResults?: number;
}

export class PaginationHelper {
  /**
   * Process paginated API response
   */
  static processPaginatedResponse(
    response: IDataObject,
    options: PaginationOptions
  ): PaginatedResponse {
    	// Extract data from response - adjust based on actual API response structure
	let data: IDataObject[] = [];
	
	if (Array.isArray(response.result)) {
		data = response.result as IDataObject[];
	} else if (Array.isArray(response.data)) {
		data = response.data as IDataObject[];
	} else if (Array.isArray(response)) {
		data = response as IDataObject[];
	} else {
		// If response is a single object, wrap it in an array
		data = [response];
	}

    const currentOffset = options.offset || 0;
    const requestedRows = options.rows || 25;
    const maxResults = options.maxResults || Infinity;

    // Calculate pagination info
    const hasMore = data.length === requestedRows && (currentOffset + data.length) < maxResults;
    const nextOffset = currentOffset + data.length;

    // Limit results if maxResults is specified
    if (maxResults < Infinity && (currentOffset + data.length) > maxResults) {
      const remainingResults = maxResults - currentOffset;
      data = data.slice(0, remainingResults);
    }

    return {
      data,
      hasMore,
      nextOffset,
      totalResults: response.count as number || undefined,
    };
  }

  /**
   * Build request parameters for pagination
   */
  static buildPaginationParams(
    baseParams: IDataObject,
    options: PaginationOptions
  ): IDataObject {
    const params = { ...baseParams };

    if (options.offset !== undefined) {
      params.offset = options.offset;
    }

    if (options.rows !== undefined) {
      params.rows = Math.min(options.rows, 1000); // API limit
    }

    return params;
  }

  /**
   * Calculate optimal batch size based on expected results
   */
  static calculateBatchSize(
    totalExpected: number,
    maxBatchSize: number = 1000
  ): number {
    // Use smaller batches for smaller datasets to reduce memory usage
    if (totalExpected <= 100) return Math.min(25, totalExpected);
    if (totalExpected <= 500) return Math.min(50, totalExpected);
    if (totalExpected <= 2000) return Math.min(100, totalExpected);
    
    return Math.min(maxBatchSize, totalExpected);
  }

  /**
   * Validate pagination options
   */
  static validatePaginationOptions(options: PaginationOptions): string[] {
    const errors: string[] = [];

    if (options.offset !== undefined && options.offset < 0) {
      errors.push('Offset must be non-negative');
    }

    if (options.rows !== undefined) {
      if (options.rows < 1) {
        errors.push('Rows must be at least 1');
      }
      if (options.rows > 1000) {
        errors.push('Rows cannot exceed 1000 (API limit)');
      }
    }

    if (options.maxResults !== undefined && options.maxResults < 1) {
      errors.push('MaxResults must be at least 1');
    }

    return errors;
  }
} 