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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { departments as globalDepartments } from '@/hooks/data';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Settings, Star, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { EvaluationFrequencyManager } from './components/evaluation-frequency-manager';
import { EvaluationSettingsManager } from './components/evaluation-settings-manager';

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
    frequencies: Array<{
        department: string;
        evaluation_frequency: 'semi_annual' | 'annual';
        employee_count: number;
    }>;
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        can_evaluate: boolean;
    };
}

export default function SupervisorManagement({ supervisors, departments, assignments, frequencies, user_permissions }: Props) {
    const [newAssignment, setNewAssignment] = useState({
        user_id: '',
        department: '',
        can_evaluate: true,
    });

    // Use global departments instead of prop departments
    const availableDepartments = globalDepartments;

    const isAdmin = user_permissions?.is_super_admin || false;
    const isSupervisor = user_permissions?.is_supervisor || false;

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
                                        <p className="text-muted-foreground">Manage supervisors and evaluation settings</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="supervisors" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="supervisors" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Supervisors
                                </TabsTrigger>
                                {isAdmin && (
                                    <TabsTrigger value="frequencies" className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Evaluation Frequencies
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {/* Supervisors Tab */}
                            <TabsContent value="supervisors" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                                                            {availableDepartments.map((department) => (
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
                                                        onCheckedChange={(checked) =>
                                                            setNewAssignment((prev) => ({ ...prev, can_evaluate: checked }))
                                                        }
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
                                                                            assignment for {assignment.user.firstname} {assignment.user.lastname} from
                                                                            the {assignment.department} department.
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
                                                {assignments.length === 0 && (
                                                    <div className="py-8 text-center text-gray-500">No assignments found</div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Frequencies Tab */}
                            {isAdmin && (
                                <TabsContent value="frequencies" className="space-y-6">
                                    <EvaluationFrequencyManager isAdmin={isAdmin} frequencies={frequencies} />
                                </TabsContent>
                            )}

                            {/* Evaluation Settings Tab */}
                            {isAdmin && (
                                <TabsContent value="settings" className="space-y-6">
                                    <EvaluationSettingsManager isAdmin={isAdmin} />
                                </TabsContent>
                            )}

                            {/* Evaluations Tab */}
                            <TabsContent value="evaluations" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Supervisor Evaluation Status */}
                                    {isSupervisor && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Star className="h-5 w-5 text-yellow-600" />
                                                    Your Evaluation Status
                                                </CardTitle>
                                                <CardDescription>Track your evaluation progress for supervised employees</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                                                        <div>
                                                            <div className="font-medium text-blue-900">Pending Evaluations</div>
                                                            <div className="text-sm text-blue-700">Employees awaiting evaluation</div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                            0
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                                        <div>
                                                            <div className="font-medium text-green-900">Completed This Period</div>
                                                            <div className="text-sm text-green-700">Evaluations finished</div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                                            0
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button className="mt-4 w-full" variant="outline">
                                                    View All Evaluations
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Evaluation Guidelines */}
                                    {/* <Card>
                                        <CardHeader>
                                            <CardTitle>Evaluation Guidelines</CardTitle>
                                            <CardDescription>Understanding evaluation frequencies and periods</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 text-sm">
                                                <div className="rounded-lg bg-blue-50 p-3">
                                                    <div className="font-medium text-blue-900">Semi-Annual Evaluations</div>
                                                    <div className="text-blue-700">
                                                        • Period 1: January-June (Jan-Jun)
                                                        <br />
                                                        • Period 2: July-December (Jul-Dec)
                                                        <br />• Every 6 months
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-green-50 p-3">
                                                    <div className="font-medium text-green-900">Annual Evaluations</div>
                                                    <div className="text-green-700">
                                                        • Period: January-December (Jan-Dec)
                                                        <br />• Once per year
                                                    </div>
                                                </div>
                                    </div>
                                </CardContent>
                            </Card> */}
                                </div>
                            </TabsContent>
                        </Tabs>
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
