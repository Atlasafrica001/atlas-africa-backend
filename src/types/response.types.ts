// Admin stats response
export interface AdminStatsResponse {
  consultations: {
    total: number;
    pending: number;
    contacted: number;
    converted: number;
    newThisMonth: number;
  };
  waitlist: {
    total: number;
    notified: number;
    pending: number;
  };
  blog: {
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
  };
  services: {
    active: number;
    total: number;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
