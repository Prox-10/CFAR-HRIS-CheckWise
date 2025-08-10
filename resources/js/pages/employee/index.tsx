import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import AddEmployeeModal from './components/addemployeemodal';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EditEmployeeModal from './components/editemployeemodal';
import { SectionCards } from './components/section-cards';
import { Employees } from './types/employees';
// import { Employees } from './components/columns';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { ContentLoading } from '@/components/ui/loading';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { usePermission } from '@/hooks/user-permission';
import axios from 'axios';
import { useEffect as useLayoutEffect } from 'react';
import RegisterFingerprintModal from './components/registerfingerprintmodal';
import ViewEmployeeDetails from './components/viewemployeedetails';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee Management',
        href: '/employee',
    },
];

interface Props {
    employee: Employees[];
    totalDepartment: number;
    totalEmployee: number;
    departments?: string[];
    positions?: string[];
}

// Move SidebarHoverLogic outside the main component
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

export default function Employee({ employee, totalEmployee, totalDepartment, departments = [], positions = [] }: Props) {
    const { can } = usePermission();
    const [data, setData] = useState<Employees[]>(employee);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employees | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewEmployee, setViewEmployee] = useState<Employees | null>(null);
    const [loading, setLoading] = useState(true);
    const [registerFingerprintEmployee, setRegisterFingerprintEmployee] = useState<Employees | null>(null);
    const [isRegisterFingerprintOpen, setIsRegisterFingerprintOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setData(employee);
            setLoading(false);
        }, 500);
    }, [employee]);

    // Expose handler for table button
    useLayoutEffect(() => {
        (window as any).onRegisterFingerprint = (employee: Employees) => {
            setRegisterFingerprintEmployee(employee);
            setIsRegisterFingerprintOpen(true);
            toast.info(`Register fingerprint for ${employee.employee_name}`);
        };
        return () => {
            (window as any).onRegisterFingerprint = undefined;
        };
    }, []);

    const handleRegisterFingerprint = (employee: Employees) => {
        setRegisterFingerprintEmployee(employee);
        setIsRegisterFingerprintOpen(true);
        toast.info(`Register fingerprint for ${employee.employee_name}`);
    };

    const handleUpdate = (updatedEmployee: Employees) => {
        setData((prevData) => prevData.map((employee) => (employee.id === updatedEmployee.id ? updatedEmployee : employee)));
    };

    const handleEdit = (employee: Employees) => {
        // Logic for editing the employee (open the edit modal, prefill the data, etc.)
        console.log('Editing employee', employee);
        // You can set the state to open an edit modal, like:
        setSelectedEmployee(employee);
        setEditModalOpen(true); // Assuming you have a state for edit modal visibility
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        // Logic for deleting the employee (e.g., API call)
        router.delete(`/employee/${id}`, {
            onSuccess: () => {
                toast.success('Employee Deleted!', {
                    duration: 1500,
                });
                // Close the modal after successful deletion
                onSuccess(); // This will trigger the onClose callback to close the modal
            },
            onError: () => {
                toast.error('Failed to delete employee!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get<Employees[]>('/api/employee/all');
            setData(res.data);
            toast.success('Employee list refreshed!');
        } catch (err) {
            toast.error('Failed to refresh employee list!');
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <SidebarProvider>
            <Head title="Employees" />
            <Toaster position="top-center" richColors />
            {/* Sidebar hover logic */}
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
                                                <h2 className="flex text-2xl font-bold tracking-tight">Employee</h2>
                                                <p className="text-muted-foreground">Manage your organization's workforce</p>
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
                                                        <SectionCards totalEmployee={totalEmployee} employee={[]} totalDepartment={totalDepartment} />
                                                        {/* <SectionCards totalRevenue={totalRevenue} payments={[]} totalEmployee={totalEmployee} /> */}
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
                                            <CardTitle>Employee List</CardTitle>
                                            <CardDescription>List of employee</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Replace with your data */}
                                            <DataTable
                                                columns={columns(
                                                    can,
                                                    setIsViewOpen,
                                                    (emp) => setViewEmployee(emp),
                                                    setIsModalOpen,
                                                    setEditModalOpen,
                                                    (emp) => setSelectedEmployee(emp),
                                                    (emp) => handleEdit(emp),
                                                    handleDelete,
                                                )}
                                                // data={employee}
                                                data={data}
                                                onRefresh={handleRefresh}
                                                refreshing={refreshing}
                                            />
                                            <EditEmployeeModal
                                                isOpen={editModelOpen}
                                                onClose={() => setEditModalOpen(false)}
                                                employee={selectedEmployee}
                                                onUpdate={handleUpdate}
                                                departments={departments}
                                                positions={positions}
                                            />
                                            <ViewEmployeeDetails
                                                isOpen={isViewOpen}
                                                onClose={() => setIsViewOpen(false)}
                                                employee={viewEmployee}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onRegisterFingerprint={handleRegisterFingerprint}
                                            />
                                            <AddEmployeeModal
                                                isOpen={isModelOpen}
                                                onClose={() => setIsModalOpen(false)}
                                                departments={departments}
                                                positions={positions}
                                            />
                                            <RegisterFingerprintModal
                                                isOpen={isRegisterFingerprintOpen}
                                                onClose={() => setIsRegisterFingerprintOpen(false)}
                                                employee={registerFingerprintEmployee}
                                            />
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
