import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/axios';
import { useCreateProductMutation, useUpdateProductMutation } from './api';
import type { Product } from './types';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

interface FormFields {
  name: string;
  sku: string;
  category: string;
  purchasePrice: string;
  sellingPrice: string;
  stockQuantity: string;
}

const emptyFields: FormFields = {
  name: '',
  sku: '',
  category: '',
  purchasePrice: '',
  sellingPrice: '',
  stockQuantity: '',
};

function fieldsFromProduct(product: Product): FormFields {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    purchasePrice: String(product.purchasePrice),
    sellingPrice: String(product.sellingPrice),
    stockQuantity: String(product.stockQuantity),
  };
}

export default function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const isEditMode = Boolean(product);
  const [fields, setFields] = useState<FormFields>(product ? fieldsFromProduct(product) : emptyFields);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setFields(product ? fieldsFromProduct(product) : emptyFields);
      setImageFile(null);
      setError(null);
    }
  }, [open, product]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  function handleFieldChange(field: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!fields.name.trim()) return 'Name is required';
    if (!fields.sku.trim()) return 'SKU is required';
    if (!fields.category.trim()) return 'Category is required';
    if (fields.purchasePrice.trim() === '' || Number(fields.purchasePrice) < 0) {
      return 'Purchase price must be a non-negative number';
    }
    if (fields.sellingPrice.trim() === '' || Number(fields.sellingPrice) < 0) {
      return 'Selling price must be a non-negative number';
    }
    if (fields.stockQuantity.trim() === '' || Number(fields.stockQuantity) < 0) {
      return 'Stock quantity must be a non-negative number';
    }
    if (!isEditMode && !imageFile) return 'Image is required';
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const payload = {
      name: fields.name.trim(),
      sku: fields.sku.trim(),
      category: fields.category.trim(),
      purchasePrice: Number(fields.purchasePrice),
      sellingPrice: Number(fields.sellingPrice),
      stockQuantity: Number(fields.stockQuantity),
      ...(imageFile ? { image: imageFile } : {}),
    };

    if (isEditMode && product) {
      updateMutation.mutate(
        { id: product._id, data: payload },
        {
          onSuccess: () => {
            toast.success('Product updated');
            onOpenChange(false);
          },
          onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, image: imageFile! },
        {
          onSuccess: () => {
            toast.success('Product created');
            onOpenChange(false);
          },
          onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
        },
      );
    }
  }

  const existingImageUrl = product ? `${import.meta.env.VITE_SOCKET_URL}${product.image}` : null;
  const previewSrc = imagePreview ?? existingImageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={fields.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={fields.sku} onChange={(e) => handleFieldChange('sku', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={fields.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase price</Label>
              <Input
                id="purchasePrice"
                type="number"
                min={0}
                step="0.01"
                value={fields.purchasePrice}
                onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling price</Label>
              <Input
                id="sellingPrice"
                type="number"
                min={0}
                step="0.01"
                value={fields.sellingPrice}
                onChange={(e) => handleFieldChange('sellingPrice', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock qty</Label>
              <Input
                id="stockQuantity"
                type="number"
                min={0}
                step="1"
                value={fields.stockQuantity}
                onChange={(e) => handleFieldChange('stockQuantity', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image {isEditMode && <span className="text-muted-foreground">(optional)</span>}</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            {previewSrc && (
              <img
                src={previewSrc}
                alt="Product preview"
                className="mt-2 h-24 w-24 rounded-md border object-cover"
              />
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditMode ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
