import { useState } from 'react';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks';
import { getErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useRolesQuery, useUpdateUserMutation, useUsersQuery } from './api';
import UserFormDialog from './UserFormDialog';
import type { AppUser } from './types';

export default function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const { data: users, isLoading, isError, error } = useUsersQuery();
  const { data: roles } = useRolesQuery();
  const updateMutation = useUpdateUserMutation();

  function handleRoleChange(user: AppUser, roleId: string) {
    updateMutation.mutate(
      { id: user._id, data: { roleId } },
      {
        onSuccess: () => toast.success(`${user.name}'s role updated`),
        onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
      },
    );
  }

  function handleToggleActive(user: AppUser) {
    updateMutation.mutate(
      { id: user._id, data: { isActive: !user.isActive } },
      {
        onSuccess: () => toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`),
        onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Create accounts and assign roles</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Add User</Button>
      </div>

      <Card>
        <CardHeader />
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading users...</p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-destructive">{getErrorMessage(error)}</p>
          ) : !users || users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user._id === currentUserId;
                  return (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.name}
                        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role._id}
                          onValueChange={(value) => handleRoleChange(user, value)}
                          disabled={isSelf}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(roles ?? []).map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          disabled={isSelf}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
