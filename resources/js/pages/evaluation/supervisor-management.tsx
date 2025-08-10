import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
    {
        title: 'Supervisor Management',
        href: '/evaluation/supervisor-management',
    },
];

interface Supervisor {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    department: string;
    supervised_departments: Array<{
        id: number;
        department: string;
        can_evaluate: boolean;
    }>;
}

interface Assignment {
    id: number;
    user_id: number;
    department: string;
    can_evaluate: boolean;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
}

interface Props {
    supervisors: Supervisor[];
    departments: string[];
    assignments: Assignment[];
}

export default function SupervisorManagement({ supervisors, departments, assignments }: Props) {
    const [newAssignment, setNewAssignment] = useState({
        user_id: '',
        department: '',
        can_evaluate: true,
    });

    const handleCreateAssignment = () => {
        if (!newAssignment.user_id || !newAssignment.department) {
            toast.error('Please fill in all required fields');
            return;
        }

        router.post(route('evaluation.supervisor-management.store'), newAssignment, {
            onSuccess: () => {
                toast.success('Supervisor assignment created successfully');
                setNewAssignment({ user_id: '', department: '', can_evaluate: true });
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleUpdateAssignment = (assignmentId: number, canEvaluate: boolean) => {
        router.put(
            route('evaluation.supervisor-management.update', assignmentId),
            {
                can_evaluate: canEvaluate,
            },
            {
                onSuccess: () => {
                    toast.success('Assignment updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleDeleteAssignment = (assignmentId: number) => {
        router.delete(route('evaluation.supervisor-management.destroy', assignmentId), {
            onSuccess: () => {
                toast.success('Assignment removed successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Supervisor Management" />
            <Toaster position="top-right" richColors closeButton />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Supervisor Management</h2>
                                        <p className="text-muted-foreground">Manage supervisor-department assignments</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {/* Create New Assignment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create New Assignment</CardTitle>
                                    <CardDescription>Assign a supervisor to a department</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="supervisor">Supervisor</Label>
                                            <Select
                                                value={newAssignment.user_id}
                                                onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, user_id: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supervisor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {supervisors.map((supervisor) => (
                                                        <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                                            {supervisor.firstname} {supervisor.lastname} ({supervisor.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="department">Department</Label>
                                            <Select
                                                value={newAssignment.department}
                                                onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, department: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((department) => (
                                                        <SelectItem key={department} value={department}>
                                                            {department}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="can_evaluate"
                                                checked={newAssignment.can_evaluate}
                                                onCheckedChange={(checked) => setNewAssignment((prev) => ({ ...prev, can_evaluate: checked }))}
                                            />
                                            <Label htmlFor="can_evaluate">Can Evaluate</Label>
                                        </div>
                                    </div>
                                    <Button onClick={handleCreateAssignment} className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Assignment
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Current Assignments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Assignments</CardTitle>
                                    <CardDescription>Manage existing supervisor-department assignments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {assignments.map((assignment) => (
                                            <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <div className="font-medium">
                                                        {assignment.user.firstname} {assignment.user.lastname}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{assignment.user.email}</div>
                                                    <div className="text-sm text-gray-500">Department: {assignment.department}</div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={assignment.can_evaluate}
                                                            onCheckedChange={(checked) => handleUpdateAssignment(assignment.id, checked)}
                                                        />
                                                        <span className="text-sm">Can Evaluate</span>
                                                    </div>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently remove the supervisor
                                                                    assignment for {assignment.user.firstname} {assignment.user.lastname} from the{' '}
                                                                    {assignment.department} department.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete Assignment
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                        {assignments.length === 0 && <div className="py-8 text-center text-gray-500">No assignments found</div>}
                                    </div>
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
