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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getErrorMessage } from '@/lib/axios';
import { useCreateUserMutation, useRolesQuery } from './api';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyFields = { name: '', email: '', password: '', roleId: '' };

export default function UserFormDialog({ open, onOpenChange }: UserFormDialogProps) {
  const [fields, setFields] = useState(emptyFields);
  const [error, setError] = useState<string | null>(null);
  const { data: roles } = useRolesQuery();
  const createMutation = useCreateUserMutation();

  useEffect(() => {
    if (open) {
      setFields(emptyFields);
      setError(null);
    }
  }, [open]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fields.name.trim()) return setError('Name is required');
    if (!fields.email.trim()) return setError('Email is required');
    if (fields.password.length < 6) return setError('Password must be at least 6 characters');
    if (!fields.roleId) return setError('Role is required');
    setError(null);

    createMutation.mutate(fields, {
      onSuccess: () => {
        toast.success('User created');
        onOpenChange(false);
      },
      onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>Create a new account and assign it a role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={fields.name}
              onChange={(e) => setFields((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={fields.email}
              onChange={(e) => setFields((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              value={fields.password}
              onChange={(e) => setFields((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select
              value={fields.roleId}
              onValueChange={(value) => setFields((prev) => ({ ...prev, roleId: value }))}
            >
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {(roles ?? []).map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
