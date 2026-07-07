import type { AuthUser } from '@/types/api';

export function hasPermission(user: AuthUser | null, permissionKey: string): boolean {
  return user?.role.permissions.includes(permissionKey) ?? false;
}
