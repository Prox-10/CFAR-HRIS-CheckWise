import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { SiteHeader } from '@/components/employee-site-header';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Role Management',
    href: '/permission/role/index',
  },
  {
    title: 'Edit Role',
    href: '/permission/role/edit',
  },
];

interface PageProps {
  role: {
    id: number;
    name: string;
    permissions: string[];
    created_at: string;
  };
  permissions: Array<{
    id: number;
    name: string;
    created_at: string;
    selected: boolean;
  }>;
  [key: string]: any;
}

export default function EditRole() {
  const { role, permissions } = usePage<PageProps>().props;

  const { data, setData, put, processing, errors } = useForm({
    role_name: role.name,
    permissions: role.permissions || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('role.update', role.id));
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setData('permissions', [...data.permissions, permissionName]);
    } else {
      setData('permissions', data.permissions.filter(p => p !== permissionName));
    }
  };

  return (
    <SidebarProvider>
      <Head title="Edit Role" />
      <Toaster position="top-right" richColors />
      <SidebarHoverLogic>
        <SidebarInset>
          <SiteHeader breadcrumbs={breadcrumbs} title={''} />
          <Main fixed>
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
              <div>
                <div className="ms-2 flex items-center">
                  <ShieldCheck className="size-11" />
                  <div className="ms-2">
                    <h2 className="flex text-2xl font-bold tracking-tight">Edit Role</h2>
                    <p className="text-muted-foreground">Update role information and permissions</p>
                  </div>
                </div>
              </div>
              <Link href={route('role.index')}>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Roles
                </Button>
              </Link>
            </div>
            <Separator className="shadow-sm" />
            <div className="m-3 no-scrollbar">
              <Card className="border-main bg-background drop-shadow-lg dark:bg-backgrounds">
                <CardHeader>
                  <CardTitle>Edit Role: {role.name}</CardTitle>
                  <CardDescription>Update role details and assign permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="role_name">Role Name</Label>
                      <Input
                        id="role_name"
                        value={data.role_name}
                        onChange={(e) => setData('role_name', e.target.value)}
                        placeholder="Enter role name"
                        className={errors.role_name ? 'border-red-500' : ''}
                      />
                      {errors.role_name && (
                        <p className="text-sm text-red-500">{errors.role_name}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={data.permissions.includes(permission.name)}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.name, checked as boolean)
                              }
                            />
                            <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.permissions && (
                        <p className="text-sm text-red-500">{errors.permissions}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={route('role.index')}>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Role'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </Main>
        </SidebarInset>
      </SidebarHoverLogic>
    </SidebarProvider>
  );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
  return (
    <>
      <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
      <AppSidebar onMouseLeave={handleMouseLeave} />
      {children}
    </>
  );
} 