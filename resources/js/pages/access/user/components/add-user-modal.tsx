'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Array<{
    id: number;
    name: string;
  }>;
}

export default function AddUserModal({ isOpen, onClose, roles }: AddUserModalProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    password: '',
    department: '',
    roles: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.firstname.trim() || !data.lastname.trim() || !data.email.trim() || !data.password.trim() || !data.department.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    post('/permission/user/store', {
      onSuccess: () => {
        toast.success('User created successfully');
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with roles and permissions.
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

            {/* Email and Password */}
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
                <Label htmlFor="password" className="text-right">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Enter password"
                  className="col-span-3"
                  disabled={processing}
                />
                {errors.password && (
                  <span className="col-span-4 text-sm text-red-500">{errors.password}</span>
                )}
              </div>
            </div>

            {/* Department */}
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
              disabled={processing || !data.firstname.trim() || !data.lastname.trim() || !data.email.trim() || !data.password.trim() || !data.department.trim()}
            >
              {processing ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 