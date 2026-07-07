import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useCreateSaleMutation, useProductPickerQuery } from './api';
import type { Product } from '@/features/products/types';

interface DraftLine {
  key: string;
  productId: string;
  quantity: string;
}

let nextKey = 0;
function createEmptyLine(): DraftLine {
  nextKey += 1;
  return { key: `line-${nextKey}`, productId: '', quantity: '1' };
}

export default function CreateSalePage() {
  const [lines, setLines] = useState<DraftLine[]>([createEmptyLine()]);
  const { data: products, isLoading, isError, error } = useProductPickerQuery();
  const createSaleMutation = useCreateSaleMutation();

  const productsById = new Map<string, Product>((products ?? []).map((p) => [p._id, p]));
  const selectedProductIds = new Set(lines.map((l) => l.productId).filter(Boolean));

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, createEmptyLine()]);
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.key !== key) : prev));
  }

  function resetForm() {
    setLines([createEmptyLine()]);
  }

  const total = lines.reduce((sum, line) => {
    const product = productsById.get(line.productId);
    const quantity = Number(line.quantity);
    if (!product || !Number.isFinite(quantity) || quantity <= 0) return sum;
    return sum + product.sellingPrice * quantity;
  }, 0);

  const hasValidLine = lines.some((line) => {
    const quantity = Number(line.quantity);
    return line.productId && Number.isInteger(quantity) && quantity > 0;
  });

  function handleSubmit() {
    const items = lines
      .filter((line) => line.productId)
      .map((line) => ({ productId: line.productId, quantity: Number(line.quantity) }));

    createSaleMutation.mutate(
      { items },
      {
        onSuccess: (sale) => {
          toast.success(`Sale recorded — total ${sale.totalAmount.toFixed(2)}`);
          resetForm();
        },
        onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
      },
    );
  }

  const noProducts = !isLoading && !isError && (products ?? []).length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Sale</h1>
        <p className="text-sm text-muted-foreground">Record a sale by selecting products and quantities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>Add one or more products to this sale</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading products...</p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-destructive">{getErrorMessage(error)}</p>
          ) : noProducts ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products available. Add products before recording a sale.
            </p>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => {
                const selectedProduct = productsById.get(line.productId);
                return (
                  <div key={line.key} className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`product-${line.key}`}>Product</Label>
                      <Select
                        value={line.productId}
                        onValueChange={(value) => updateLine(line.key, { productId: value })}
                      >
                        <SelectTrigger id={`product-${line.key}`}>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {(products ?? []).map((product) => {
                            const isTaken = selectedProductIds.has(product._id) && product._id !== line.productId;
                            return (
                              <SelectItem key={product._id} value={product._id} disabled={isTaken}>
                                {product.name} ({product.sku}) — stock: {product.stockQuantity}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-28 space-y-2">
                      <Label htmlFor={`quantity-${line.key}`}>Quantity</Label>
                      <Input
                        id={`quantity-${line.key}`}
                        type="number"
                        min={1}
                        step={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                      />
                    </div>
                    <div className="w-28 text-sm text-muted-foreground">
                      {selectedProduct && Number(line.quantity) > 0
                        ? (selectedProduct.sellingPrice * Number(line.quantity)).toFixed(2)
                        : '—'}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}

              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                Add line
              </Button>
            </div>
          )}
        </CardContent>
        {!isLoading && !isError && !noProducts && (
          <>
            <Separator />
            <CardFooter className="flex items-center justify-between pt-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated total (preview)</p>
                <p className="text-xl font-semibold">{total.toFixed(2)}</p>
              </div>
              <Button onClick={handleSubmit} disabled={!hasValidLine || createSaleMutation.isPending}>
                {createSaleMutation.isPending ? 'Recording sale...' : 'Record sale'}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
