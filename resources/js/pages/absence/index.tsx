import { AppSidebar } from '@/components/app-sidebar';
import { ChartLineLabel } from '@/components/chartlinelabel';
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
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
}

interface Props {
    absences: Absence[];
    employees: Employee[];
    monthlyAbsenceStats?: Array<{
        month: string;
        year: number;
        absences: number;
        percentage: number;
        date: string;
    }>;
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function Index({ absences = [], employees = [], monthlyAbsenceStats = [], user_permissions }: Props) {
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
                                                    absenceStats={{
                                                        totalAbsences: absences.length,
                                                        pendingAbsences: absences.filter((a) => a.status === 'pending').length,
                                                        approvedAbsences: absences.filter((a) => a.status === 'approved').length,
                                                        rejectedAbsences: absences.filter((a) => a.status === 'rejected').length,
                                                    }}
                                                    isSupervisor={user_permissions?.is_supervisor || false}
                                                    roleContent={{
                                                        totalLabel: user_permissions?.is_supervisor ? 'Your Absences' : 'Total Absences',
                                                        approvedLabel: user_permissions?.is_supervisor ? 'Your Approved' : 'Approved',
                                                        pendingLabel: user_permissions?.is_supervisor ? 'Your Pending' : 'Pending',
                                                        rejectedLabel: user_permissions?.is_supervisor ? 'Your Rejected' : 'Rejected',
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
                                    <CardTitle className="text-sm font-semibold">Absence List</CardTitle>
                                    <CardDescription>List of employee absences</CardDescription>
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
                                    <ViewAbsenceModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} absence={viewAbsence} />
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
