import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiSuccessResponse, AuthUser } from '@/types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: AuthUser;
}

async function login(payload: LoginPayload): Promise<LoginResult> {
  const { data } = await api.post<ApiSuccessResponse<LoginResult>>('/auth/login', payload);
  return data.data;
}

export function useLoginMutation() {
  return useMutation({ mutationFn: login });
}
