import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/customize/header';
import { Main } from '@/components/customize/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { User2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import AddEmployeeModal from './components/addemployeemodal';
import  {columns} from './components/columns';
import { DataTable } from './components/data-table';
import EditEmployeeModal from './components/editemployeemodal';
import { SectionCards } from './components/section-cards';
import { Employees } from './types/employees';
// import { Employees } from './components/columns';
import ViewEmployeeDetails from './components/viewemployeedetails';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee',
        href: '/employee',
    },
];

interface Props {
    employee: Employees[];
    totalDepartment: number;
    totalEmployee: number;
}

export default function Employee({ employee, totalEmployee, totalDepartment }: Props) {
    const [data, setData] = useState<Employees[]>(employee);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employees | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewEmployee, setViewEmployee] = useState<Employees | null>(null);

    useEffect(() => {
        setData(employee);
    }, [employee]);

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

    return (
        <SidebarProvider>
            <Toaster position="top-right" richColors />
            <AppSidebar />
            <Head title="Employees" />
            <SidebarInset>
                {/* <HeaderShrink/> */}
                <Header fixed className="hidden md:flex" />

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
                                            <SectionCards 
                                            totalEmployee={totalEmployee} employee={[]} 
                                            totalDepartment={totalDepartment} />
                                            {/* <SectionCards totalRevenue={totalRevenue} payments={[]} totalEmployee={totalEmployee} /> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <Separator className="shadow-sm" />
                    </Tabs>

                    <div className="m-3 no-scrollbar">
                        <Card className="border-main bg-background drop-shadow-lg dark:bg-backgrounds">
                            <CardHeader>
                                <CardTitle>Employee List</CardTitle>
                                <CardDescription>List of employee</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Replace with your data */}

                                <DataTable
                                    columns={columns(
                                        setIsViewOpen, // Pass setIsViewOpen
                                        setViewEmployee, // Pass setViewEmployee
                                        setIsModalOpen,
                                        setEditModalOpen,
                                        setSelectedEmployee, 
                                        handleEdit,
                                        handleDelete,
                                       
                                    )}
                                    data={employee}
                                />
                                <EditEmployeeModal
                                    isOpen={editModelOpen}
                                    onClose={() => setEditModalOpen(false)}
                                    employee={selectedEmployee}
                                    onUpdate={handleUpdate}
                                />

                                <ViewEmployeeDetails
                                    isOpen={isViewOpen}
                                    onClose={() => setIsViewOpen(false)}
                                    employee={viewEmployee}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />

                                <AddEmployeeModal 
                                isOpen={isModelOpen} 
                                onClose={() => setIsModalOpen(false)} 
                                />
                            </CardContent>
                        </Card>
                    </div>
                </Main>
            </SidebarInset>
        </SidebarProvider>
    );
}
