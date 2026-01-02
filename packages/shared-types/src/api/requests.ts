/**
 * Common API request types
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface ListRequest extends Partial<PaginationParams>, Partial<SortParams> {
  filters?: FilterParams;
}
