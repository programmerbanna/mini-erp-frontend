export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
