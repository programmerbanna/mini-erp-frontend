import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useDeleteRoleMutation, useRolesQuery } from './api';
import RoleFormDialog from './RoleFormDialog';
import type { Role } from './types';

export default function RolesPage() {
  const { data: roles, isLoading, isError, error } = useRolesQuery();
  const deleteMutation = useDeleteRoleMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

  function openCreateDialog() {
    setEditingRole(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(role: Role) {
    setEditingRole(role);
    setDialogOpen(true);
  }

  function handleDelete(role: Role) {
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(role._id, {
      onSuccess: () => toast.success('Role deleted'),
      onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Define roles and the permissions they grant (changes apply immediately)
          </p>
        </div>
        <Button onClick={openCreateDialog}>Add Role</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading roles...</p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-destructive">{getErrorMessage(error)}</p>
          ) : (roles ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No roles found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(roles ?? []).map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">{role.description}</TableCell>
                    <TableCell>
                      <div className="flex max-w-md flex-wrap gap-1">
                        {role.permissions.length === 0 ? (
                          <span className="text-sm text-muted-foreground">None</span>
                        ) : (
                          role.permissions.map((key) => (
                            <Badge key={key} variant="secondary" className="font-mono text-xs">
                              {key}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(role)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(role)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RoleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} role={editingRole} />
    </div>
  );
}
