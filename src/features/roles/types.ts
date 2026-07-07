export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  key: string;
  description: string;
}
