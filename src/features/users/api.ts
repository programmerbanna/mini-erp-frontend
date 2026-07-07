import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AppUser, RoleOption } from './types';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserInput {
  id: string;
  data: { roleId?: string; isActive?: boolean };
}

async function fetchUsers(): Promise<AppUser[]> {
  const { data } = await api.get<ApiSuccessResponse<AppUser[]>>('/users');
  return data.data;
}

async function fetchRoles(): Promise<RoleOption[]> {
  const { data } = await api.get<ApiSuccessResponse<RoleOption[]>>('/roles');
  return data.data;
}

async function createUser(input: CreateUserInput): Promise<AppUser> {
  const { data } = await api.post<ApiSuccessResponse<AppUser>>('/users', input);
  return data.data;
}

async function updateUser({ id, data: input }: UpdateUserInput): Promise<AppUser> {
  const { data } = await api.patch<ApiSuccessResponse<AppUser>>(`/users/${id}`, input);
  return data.data;
}

export function useUsersQuery() {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers });
}

export function useRolesQuery() {
  return useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
