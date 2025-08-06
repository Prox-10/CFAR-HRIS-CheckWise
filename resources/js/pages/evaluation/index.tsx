import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { SiteHeader } from '@/components/employee-site-header';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Employees } from '@/hooks/employees';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import axios from 'axios';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { SectionCards } from './components/section-cards';
import { Evaluation } from './types/evaluation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
];

interface Props {
    employees: any[];
    evaluations: Evaluation[];
    employees_all: Employees[];
}

export default function Index({ evaluations, employees, employees_all }: Props) {
    const [data, setData] = useState<Evaluation[]>(evaluations);
    const [editModelOpen, setEditModalOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewEvaluation, setViewEvaluation] = useState<Evaluation | null>(null);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setData(evaluations);
            setLoading(false);
        }, 500);
    }, [evaluations]);

    const handleUpdate = (updatedEvaluation: Evaluation) => {
        setData((prevData) => prevData.map((evaluation) => (evaluation.id === updatedEvaluation.id ? updatedEvaluation : evaluation)));
    };

    const handleEdit = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setEditModalOpen(true);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get<Evaluation[]>('/api/evaluation/all');
            setData(res.data);
            toast.success('Employee list refreshed!');
        } catch (err) {
            toast.error('Failed to refresh employee list!');
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = (id: number, onSuccess: () => void) => {
        router.delete(`/evaluation/${id}`, {
            onSuccess: () => {
                toast.success('Evaluation Deleted!', {
                    duration: 1500,
                });
                onSuccess();
            },
            onError: () => {
                toast.error('Failed to delete evaluation!', {
                    duration: 1500,
                });
            },
            preserveScroll: true,
        });
    };

    // Ensure all employees are mapped to Evaluation type structure
    const allEmployeesAsEvaluations: Evaluation[] = employees_all.map((emp) => ({
        id: Number(emp.id),
        employee_id: Number(emp.employee_id),
        ratings: emp.ratings || '',
        rating_date: emp.rating_date || '',
        work_quality: emp.work_quality || '',
        safety_compliance: emp.safety_compliance || '',
        punctuality: emp.punctuality || '',
        teamwork: emp.teamwork || '',
        organization: emp.organization || '',
        equipment_handling: emp.equipment_handling || '',
        comment: emp.comment || '',
        employee_name: emp.employee_name,
        picture: emp.picture,
        department: emp.department,
        position: emp.position,
        employeeid: emp.employeeid,
    }));

    return (
        <SidebarProvider>
            <Head title="Evaluation" />

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
                                                <h2 className="flex text-2xl font-bold tracking-tight">Evaluation</h2>
                                                <p className="text-muted-foreground">Manage your organization's workforce</p>
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
                                                        <SectionCards />
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
                                            <CardTitle>Evaluation List</CardTitle>
                                            <CardDescription>List of Evaluation</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <DataTable
                                                columns={columns}
                                                data={allEmployeesAsEvaluations}
                                                employees={employees}
                                                employees_all={employees_all}
                                                onRefresh={handleRefresh}
                                                refreshing={refreshing}
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
