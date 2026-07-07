import { useState } from 'react';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks';
import { hasPermission } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/axios';
import { useDeleteProductMutation, useProductsQuery } from './api';
import ProductFormDialog from './ProductFormDialog';
import type { Product } from './types';

const LOW_STOCK_THRESHOLD = 5;
const PAGE_LIMIT = 10;

export default function ProductsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const { data, isLoading, isError, error } = useProductsQuery({
    search: search || undefined,
    category: category || undefined,
    page,
    limit: PAGE_LIMIT,
  });
  const deleteMutation = useDeleteProductMutation();

  const canCreate = hasPermission(user, 'product:create');
  const canUpdate = hasPermission(user, 'product:update');
  const canDelete = hasPermission(user, 'product:delete');

  function openCreateDialog() {
    setEditingProduct(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(product._id, {
      onSuccess: () => toast.success('Product deleted'),
      onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
    });
  }

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'hsl(222 47% 11%)' }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(220 13% 50%)' }}>
            Manage your inventory catalog
          </p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={openCreateDialog}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          border: '1px solid hsl(220 15% 91%)',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: '1px solid hsl(220 15% 92%)' }}
        >
          {/* Search */}
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center"
              style={{ color: 'hsl(220 13% 58%)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search name or SKU…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="erp-input pl-8 text-xs"
              style={{ maxWidth: '200px' }}
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center"
              style={{ color: 'hsl(220 13% 58%)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter by category…"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="erp-input pl-8 text-xs"
              style={{ maxWidth: '180px' }}
            />
          </div>

          {/* Clear */}
          {(search || category) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setPage(1); }}
              className="btn-ghost text-xs"
              style={{ color: 'hsl(358 72% 46%)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          )}

          {/* Result count */}
          {!isLoading && data && (
            <span
              className="ml-auto text-xs font-medium"
              style={{ color: 'hsl(220 13% 52%)' }}
            >
              {data.total ?? products.length} product{(data.total ?? products.length) !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="shimmer h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="shimmer h-3.5 w-40 rounded" />
                  <div className="shimmer h-2.5 w-24 rounded" />
                </div>
                <div className="shimmer h-5 w-14 rounded-full" />
                <div className="shimmer h-5 w-14 rounded-full" />
                <div className="shimmer h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            className="flex items-center gap-2.5 m-5 rounded-xl p-4 text-sm"
            style={{
              background: 'hsl(358 72% 52% / 0.06)',
              border: '1px solid hsl(358 72% 52% / 0.18)',
              color: 'hsl(358 72% 42%)',
            }}
          >
            {getErrorMessage(error)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'hsl(220 20% 95%)', color: 'hsl(220 13% 52%)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'hsl(222 47% 14%)' }}>No products found</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(220 13% 52%)' }}>
                {search || category ? 'Try adjusting your search or filter' : 'Get started by adding your first product'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}></th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Cost</th>
                    <th>Price</th>
                    <th>Stock</th>
                    {(canUpdate || canDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={`${import.meta.env.VITE_SOCKET_URL}${product.image}`}
                          alt={product.name}
                          className="h-9 w-9 rounded-lg object-cover"
                          style={{ border: '1px solid hsl(220 15% 91%)' }}
                        />
                      </td>
                      <td>
                        <span className="font-semibold" style={{ color: 'hsl(222 47% 11%)' }}>
                          {product.name}
                        </span>
                      </td>
                      <td>
                        <span
                          className="font-mono rounded px-1.5 py-0.5 text-xs"
                          style={{
                            background: 'hsl(245 75% 55% / 0.07)',
                            color: 'hsl(245 75% 45%)',
                          }}
                        >
                          {product.sku}
                        </span>
                      </td>
                      <td style={{ color: 'hsl(220 13% 45%)' }}>{product.category}</td>
                      <td style={{ color: 'hsl(222 47% 20%)' }}>${product.purchasePrice.toFixed(2)}</td>
                      <td>
                        <span className="font-semibold" style={{ color: 'hsl(142 60% 35%)' }}>
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: 'hsl(222 47% 14%)' }}>
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity < LOW_STOCK_THRESHOLD && (
                            <span className="status-badge danger">Low</span>
                          )}
                        </div>
                      </td>
                      {(canUpdate || canDelete) && (
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            {canUpdate && (
                              <button
                                className="btn-ghost"
                                onClick={() => openEditDialog(product)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn-danger"
                                onClick={() => handleDelete(product)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderTop: '1px solid hsl(220 15% 92%)' }}
            >
              <p className="text-xs" style={{ color: 'hsl(220 13% 52%)' }}>
                Page <strong style={{ color: 'hsl(222 47% 14%)' }}>{data?.page ?? page}</strong> of{' '}
                <strong style={{ color: 'hsl(222 47% 14%)' }}>{totalPages}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Previous
                </button>
                <button
                  className="btn-ghost"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} />
    </div>
  );
}
