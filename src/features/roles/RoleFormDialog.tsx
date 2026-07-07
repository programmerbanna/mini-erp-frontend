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
import { useCreateRoleMutation, usePermissionsQuery, useUpdateRoleMutation } from './api';
import type { Role } from './types';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
}

export default function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEditMode = Boolean(role);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const { data: permissions, isLoading: permissionsLoading } = usePermissionsQuery();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setName(role?.name ?? '');
      setDescription(role?.description ?? '');
      setSelectedKeys(new Set(role?.permissions ?? []));
      setError(null);
    }
  }, [open, role]);

  function togglePermission(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError('Name is required');
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      permissions: [...selectedKeys],
    };
    const callbacks = {
      onSuccess: () => {
        toast.success(isEditMode ? 'Role updated' : 'Role created');
        onOpenChange(false);
      },
      onError: (mutationError: Error) => toast.error(getErrorMessage(mutationError)),
    };

    if (isEditMode && role) {
      updateMutation.mutate({ id: role._id, data: payload }, callbacks);
    } else {
      createMutation.mutate(payload, callbacks);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit role' : 'Add role'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Permission changes take effect on each user’s next request — no re-login needed.'
              : 'Name the role and pick what it is allowed to do.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Name</Label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            {permissionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading permissions...</p>
            ) : (
              <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {(permissions ?? []).map((permission) => (
                  <label
                    key={permission.key}
                    className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-primary"
                      checked={selectedKeys.has(permission.key)}
                      onChange={() => togglePermission(permission.key)}
                    />
                    <span>
                      <span className="font-mono text-xs font-medium">{permission.key}</span>
                      <span className="block text-xs text-muted-foreground">
                        {permission.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditMode ? 'Save changes' : 'Create role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
