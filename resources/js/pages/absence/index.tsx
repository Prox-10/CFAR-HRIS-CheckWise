import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { columns, type Absence } from './components/columns';
import { DataTable } from './components/data-table';
import { SectionCards } from './components/section-cards';
import ViewAbsenceModal from './components/view-absence-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absence Management',
        href: '/absence',
    },
];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department: string;
    position: string;
}

interface Props {
    absences: Absence[];
    employees: Employee[];
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function Index({ absences = [], employees = [], user_permissions }: Props) {
    const [loading, setLoading] = useState(true);

    // State for view modal
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewAbsence, setViewAbsence] = useState<Absence | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

    const handleEdit = (absence: Absence) => {
        setSelectedAbsence(absence);
        setIsEditOpen(true);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the employee (e.g., API call)
        router.delete(`/absence/${id}`, {
            onSuccess: () => {
                toast.success('Absence Deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete absence!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider>
            <Head title="Absence" />
            <Toaster position="top-center" richColors />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Absence</h2>
                                        <p className="text-muted-foreground">Manage your organization's absence requests</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                            <TabsContent value="overview" className="space-y-4">
                                <div className="flex flex-1 flex-col">
                                    <div className="relative flex flex-1 flex-col">
                                        <div className="@container/main flex flex-1 flex-col gap-2">
                                            <div className="flex flex-col">
                                                <SectionCards 
                                                    isSupervisor={user_permissions?.is_supervisor || false}
                                                    totalEmployee={employees.length}
                                                    totalDepartment={user_permissions?.is_supervisor ? user_permissions.supervised_departments.length : 7}
                                                    activeAccounts={employees.filter(emp => emp.status === 'active').length}
                                                    growthRate={4.5}
                                                    roleContent={{
                                                        employeeLabel: user_permissions?.is_supervisor ? 'Your Employees' : 'Total Employee',
                                                        departmentLabel: user_permissions?.is_supervisor ? 'Your Departments' : 'Department',
                                                        activeLabel: user_permissions?.is_supervisor ? 'Active Team' : 'Active Accounts',
                                                        growthLabel: user_permissions?.is_supervisor ? 'Your Growth' : 'Growth Rate',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <Separator className="shadow-sm" />
                        </Tabs>
                        <div className="m-3 no-scrollbar">
                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                <CardHeader>
                                    <CardTitle>Absence List</CardTitle>
                                    <CardDescription>List of all absence requests</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={columns(
                                            setIsViewOpen,
                                            setViewAbsence,
                                            setIsAddOpen,
                                            setIsEditOpen,
                                            setSelectedAbsence,
                                            handleEdit,
                                            handleDelete,
                                        )}
                                        data={absences}
                                        employees={employees}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>

            {/* View Absence Modal */}
            <ViewAbsenceModal
                isOpen={isViewOpen}
                onClose={() => {
                    setIsViewOpen(false);
                    setViewAbsence(null);
                }}
                absence={viewAbsence}
            />
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
