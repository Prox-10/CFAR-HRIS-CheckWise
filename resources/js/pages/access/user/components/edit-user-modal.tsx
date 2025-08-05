'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SingleUser } from '@/types/users';
import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SingleUser | null;
  roles: Array<{
    id: number;
    name: string;
  }>;
}

export default function EditUserModal({ isOpen, onClose, user, roles }: EditUserModalProps) {
  const { data, setData, put, processing, errors, reset } = useForm({
    firstname: user?.firstname || '',
    middlename: user?.middlename || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    department: user?.department || '',
    roles: [] as number[],
  });

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setData({
        firstname: user.firstname,
        middlename: user.middlename || '',
        lastname: user.lastname,
        email: user.email,
        department: user.department || '',
        roles: user.role_ids || [],
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.firstname.trim() || !data.lastname.trim() || !data.email.trim() || !data.department.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('No user selected for editing');
      return;
    }

    put(`/permission/user/${user.id}`, {
      onSuccess: () => {
        toast.success('User updated successfully');
        reset();
        onClose();
      },
      onError: (errors) => {
        Object.keys(errors).forEach(key => {
          toast.error(errors[key]);
        });
      }
    });
  };

  const handleClose = () => {
    if (!processing) {
      reset();
      onClose();
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setData('roles', [...data.roles, roleId]);
    } else {
      setData('roles', data.roles.filter(id => id !== roleId));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information, department, and roles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstname" className="text-right">
                  First Name *
                </Label>
                <Input
                  id="firstname"
                  value={data.firstname}
                  onChange={(e) => setData('firstname', e.target.value)}
                  placeholder="Enter first name"
                  className="col-span-3"
                  disabled={processing}
                />
                {errors.firstname && (
                  <span className="col-span-4 text-sm text-red-500">{errors.firstname}</span>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="middlename" className="text-right">
                  Middle Name
                </Label>
                <Input
                  id="middlename"
                  value={data.middlename}
                  onChange={(e) => setData('middlename', e.target.value)}
                  placeholder="Enter middle name"
                  className="col-span-3"
                  disabled={processing}
                />
                {errors.middlename && (
                  <span className="col-span-4 text-sm text-red-500">{errors.middlename}</span>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastname" className="text-right">
                  Last Name *
                </Label>
                <Input
                  id="lastname"
                  value={data.lastname}
                  onChange={(e) => setData('lastname', e.target.value)}
                  placeholder="Enter last name"
                  className="col-span-3"
                  disabled={processing}
                />
                {errors.lastname && (
                  <span className="col-span-4 text-sm text-red-500">{errors.lastname}</span>
                )}
              </div>
            </div>

            {/* Email and Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="Enter email address"
                  className="col-span-3"
                  disabled={processing}
                />
                {errors.email && (
                  <span className="col-span-4 text-sm text-red-500">{errors.email}</span>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department *
                </Label>
                <div className="col-span-3">
                  <Select
                    value={data.department}
                    onValueChange={(value) => setData('department', value)}
                    disabled={processing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <span className="text-sm text-red-500">{errors.department}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Roles Selection */}
            <div className="space-y-3">
              <Label>Select Roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={data.roles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                      disabled={processing}
                    />
                    <Label htmlFor={`role-${role.id}`} className="text-sm font-normal">
                      {role.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.roles && (
                <span className="text-sm text-red-500">{errors.roles}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing || !data.firstname.trim() || !data.lastname.trim() || !data.email.trim() || !data.department.trim()}
            >
              {processing ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 