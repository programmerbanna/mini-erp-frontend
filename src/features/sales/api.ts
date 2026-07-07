import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiSuccessResponse, PaginatedData } from '@/types/api';
import type { Product } from '@/features/products/types';
import type { Sale, SaleLineItem } from './types';

export interface CreateSaleInput {
  items: SaleLineItem[];
}

async function fetchProductsForPicker(): Promise<Product[]> {
  const { data } = await api.get<ApiSuccessResponse<PaginatedData<Product>>>('/products', {
    params: { limit: 100 },
  });
  return data.data.items;
}

async function createSale(input: CreateSaleInput): Promise<Sale> {
  const { data } = await api.post<ApiSuccessResponse<Sale>>('/sales', input);
  return data.data;
}

export function useProductPickerQuery() {
  return useQuery({
    queryKey: ['products', 'picker'],
    queryFn: fetchProductsForPicker,
  });
}

export function useCreateSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
