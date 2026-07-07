export interface UserRole {
  _id: string;
  name: string;
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleOption {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
}
