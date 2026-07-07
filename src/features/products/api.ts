import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiSuccessResponse, PaginatedData } from '@/types/api';
import type { Product } from './types';

export interface ProductsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image?: File;
}

export interface UpdateProductInput {
  id: string;
  data: Partial<ProductInput>;
}

async function fetchProducts(params: ProductsQueryParams): Promise<PaginatedData<Product>> {
  const { data } = await api.get<ApiSuccessResponse<PaginatedData<Product>>>('/products', { params });
  return data.data;
}

function buildProductFormData(input: Partial<ProductInput>): FormData {
  const formData = new FormData();
  if (input.name !== undefined) formData.append('name', input.name);
  if (input.sku !== undefined) formData.append('sku', input.sku);
  if (input.category !== undefined) formData.append('category', input.category);
  if (input.purchasePrice !== undefined) formData.append('purchasePrice', String(input.purchasePrice));
  if (input.sellingPrice !== undefined) formData.append('sellingPrice', String(input.sellingPrice));
  if (input.stockQuantity !== undefined) formData.append('stockQuantity', String(input.stockQuantity));
  if (input.image) formData.append('image', input.image);
  return formData;
}

async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiSuccessResponse<Product>>('/products', buildProductFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

async function updateProduct({ id, data: input }: UpdateProductInput): Promise<Product> {
  const { data } = await api.patch<ApiSuccessResponse<Product>>(`/products/${id}`, buildProductFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export function useProductsQuery(params: ProductsQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
