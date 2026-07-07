import { useState } from 'react';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks';
import { hasPermission } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your inventory catalog</p>
        </div>
        {canCreate && <Button onClick={openCreateDialog}>Add Product</Button>}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4 space-y-0">
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
          <Input
            placeholder="Filter by category..."
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading products...</p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-destructive">{getErrorMessage(error)}</p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No products found</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Stock</TableHead>
                    {(canUpdate || canDelete) && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <img
                          src={`${import.meta.env.VITE_SOCKET_URL}${product.image}`}
                          alt={product.name}
                          className="h-10 w-10 rounded-md border object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell>{product.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.stockQuantity}
                          {product.stockQuantity < LOW_STOCK_THRESHOLD && (
                            <Badge variant="destructive">Low stock</Badge>
                          )}
                        </div>
                      </TableCell>
                      {(canUpdate || canDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                                Edit
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(product)}>
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data?.page ?? page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} />
    </div>
  );
}
