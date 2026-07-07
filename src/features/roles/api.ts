import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Permission, Role } from './types';

export interface RolePayload {
  name: string;
  description: string;
  permissions: string[];
}

async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get<ApiSuccessResponse<Role[]>>('/roles');
  return data.data;
}

async function fetchPermissions(): Promise<Permission[]> {
  const { data } = await api.get<ApiSuccessResponse<Permission[]>>('/roles/permissions');
  return data.data;
}

async function createRole(input: RolePayload): Promise<Role> {
  const { data } = await api.post<ApiSuccessResponse<Role>>('/roles', input);
  return data.data;
}

async function updateRole({ id, data: input }: { id: string; data: RolePayload }): Promise<Role> {
  const { data } = await api.patch<ApiSuccessResponse<Role>>(`/roles/${id}`, input);
  return data.data;
}

async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}

// Same ['roles'] key as the users feature's role dropdown, so a role edit here
// refreshes that dropdown too.
export function useRolesQuery() {
  return useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
}

export function usePermissionsQuery() {
  return useQuery({ queryKey: ['permissions'], queryFn: fetchPermissions });
}

function useInvalidateRoles() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['roles'] });
}

export function useCreateRoleMutation() {
  const invalidate = useInvalidateRoles();
  return useMutation({ mutationFn: createRole, onSuccess: invalidate });
}

export function useUpdateRoleMutation() {
  const invalidate = useInvalidateRoles();
  return useMutation({ mutationFn: updateRole, onSuccess: invalidate });
}

export function useDeleteRoleMutation() {
  const invalidate = useInvalidateRoles();
  return useMutation({ mutationFn: deleteRole, onSuccess: invalidate });
}
