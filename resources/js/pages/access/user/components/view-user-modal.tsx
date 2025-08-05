import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SingleUser } from '@/types/users';
import { Building2, Calendar, Mail, User } from 'lucide-react';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SingleUser | null;
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>View User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Full Name</Label>
          </div>
          <div className="pl-6">
            <p className="text-sm">{user.fullname}</p>
            <p className="text-xs text-muted-foreground">
              {user.firstname} {user.middlename ? user.middlename + ' ' : ''}{user.lastname}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Email</Label>
          </div>
          <div className="pl-6">
            <p className="text-sm">{user.email}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Department</Label>
          </div>
          <div className="pl-6">
            <p className="text-sm">{user.department || 'N/A'}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Created Date</Label>
          </div>
          <div className="pl-6">
            <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Roles</Label>
          </div>
          <div className="pl-6">
            <div className="flex flex-wrap gap-1">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, index) => (
                  <Badge key={index} variant="secondary">
                    {role}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No roles assigned</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 