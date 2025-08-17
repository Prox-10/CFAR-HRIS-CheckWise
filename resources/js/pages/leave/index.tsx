import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import AddLeaveModal from './components/addleavemodal';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EditEmployeeModal from './components/editemployeemodal';
import { SectionCards } from './components/section-cards';
import ViewLeaveDetails from './components/viewleavedetails';
import { CreditDisplay, CreditSummary } from './components/credit-display';
import { Leave } from './types/leave';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Leave Management',
        href: '/leave',
    },
];

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    department?: string;
    position?: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
}

interface Props {
    leave: Leave[];
    employees: Employee[];
    leaveStats: {
        totalLeaves: number;
        pendingLeaves: number;
        approvedLeaves: number;
        rejectedLeaves: number;
        cancelledLeaves: number;
        approvalRate: number;
    };
    leavesPerMonth: any[];
    leaveTypes: string[];
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        supervised_departments: string[];
    };
}

export default function Index({ leave, employees, leaveStats, leavesPerMonth, leaveTypes, user_permissions }: Props) {
    const [data, setData] = useState<Leave[]>(leave);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewLeave, setViewLeave] = useState<Leave | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setData(leave);
            setLoading(false);
        }, 500);
    }, [leave]);

    const handleUpdate = (updatedEmployee: Leave) => {
        setData((prevData) => prevData.map((leave) => (leave.id === updatedEmployee.id ? updatedEmployee : leave)));
    };

    const handleEdit = (leave: Leave) => {
        // Logic for editing the employee (open the edit modal, prefill the data, etc.)
        console.log('Editing leave', leave);
        // You can set the state to open an edit modal, like:
        setSelectedLeave(leave);
        setEditModalOpen(true); // Assuming you have a state for edit modal visibility
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the employee (e.g., API call)
        router.delete(`/leave/${id}`, {
            onSuccess: () => {
                toast.success('Employee deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete employee leave!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider>
            <Head title="Leave" />
            <Toaster position="top-center" richColors />

            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {loading ? (
                        <ContentLoading />
                    ) : (
                        <>
                            <Main fixed>
                                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                    <div>
                                        <div className="ms-2 flex items-center">
                                            <Users className="size-11" />
                                            <div className="ms-2">
                                                <h2 className="flex text-2xl font-bold tracking-tight">Leave Management</h2>
                                                <p className="text-muted-foreground">Manage employee leave requests and absences</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <TasksPrimaryButtons /> */}
                                </div>

                               

                                <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="flex flex-1 flex-col">
                                            <div className="relative flex flex-1 flex-col">
                                                <div className="@container/main flex flex-1 flex-col gap-2">
                                                    <div className="flex flex-col">
                                                        <SectionCards
                                                            leaveStats={leaveStats}
                                                            isSupervisor={user_permissions?.is_supervisor || false}
                                                            roleContent={{
                                                                totalLabel: user_permissions?.is_supervisor ? 'Your Leaves' : 'Total Leaves',
                                                                approvedLabel: user_permissions?.is_supervisor ? 'Your Approved' : 'Approved',
                                                                pendingLabel: user_permissions?.is_supervisor ? 'Your Pending' : 'Pending',
                                                                rejectedLabel: user_permissions?.is_supervisor
                                                                    ? 'Your Rejected'
                                                                    : 'Rejected / Cancelled',
                                                            }}
                                                        />
                                                        {/* ChartBarLabel for leave per month by type */}
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
                                            <CardTitle className="text-sm font-semibold">Leave List</CardTitle>
                                            <CardDescription>List of employee leave</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Replace with your data */}
                                            <DataTable
                                                columns={columns(
                                                    setIsViewOpen, // Pass setIsViewOpen
                                                    setViewLeave, // Pass setViewEmployee
                                                    setIsModalOpen,
                                                    setEditModalOpen,
                                                    setSelectedLeave,
                                                    handleEdit,
                                                    handleDelete,
                                                )}
                                                data={leave}
                                                employees={employees}
                                            />
                                            <EditEmployeeModal
                                                isOpen={editModelOpen}
                                                onClose={() => setEditModalOpen(false)}
                                                employee={selectedLeave}
                                                onUpdate={handleUpdate}
                                            />
                                            <ViewLeaveDetails
                                                isOpen={isViewOpen}
                                                onClose={() => setIsViewOpen(false)}
                                                leave={viewLeave}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                            />
                                            <AddLeaveModal isOpen={isModelOpen} onClose={() => setIsModalOpen(false)} employees={employees} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </Main>
                        </>
                    )}
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
