'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import * as React from 'react';

import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoading } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';
// import { Toaster } from '@/components/ui/toaster';
import { ChartBarLabel } from '@/components/chart-bar-label';
import { ChartAreaInteractive } from '@/components/chartareainteractive';
import { ChartBarLabels } from '@/components/chartbarlabels';
import { ChartLineLabel } from '@/components/chartlinelabel';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Calendar, LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RecentSales } from './components/recent-sales';
import { SectionCards } from './components/section-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Props {
    totalEmployee: number;
    totalDepartment: number;
    totalLeave: number;
    pendingLeave: number;
    leavesPerMonth: any[]; // or the correct type
    leaveTypes: string[];
    // New role-based props
    userRole: string;
    isSupervisor: boolean;
    isSuperAdmin: boolean;
    supervisedDepartments: string[];
    supervisorEmployees?: any[]; // Add this prop
}

export default function Index({
    totalEmployee,
    totalDepartment,
    totalLeave,
    pendingLeave,
    leavesPerMonth,
    leaveTypes,
    months: monthsProp,
    userRole,
    isSupervisor,
    isSuperAdmin,
    supervisedDepartments,
    supervisorEmployees,
}: Props & { months?: number }) {
    const [loading, setLoading] = useState(false);
    const [months, setMonths] = useState(monthsProp ?? 6);

    useEffect(() => {
        setTimeout(() => {
            setMonths(monthsProp ?? 6);
            setLoading(false);
        }, 500);
    }, [monthsProp]);

    const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value, 10);
        setMonths(value);
        router.visit(`/dashboard?months=${value}`, {
            preserveScroll: true,
            preserveState: true,
            only: ['leavesPerMonth', 'months'],
        });
    };

    return (
        <SidebarProvider>
            <Head title="Dashboard" />
            {/* Sidebar hover logic using the reusable hook and component */}
            {/* Use the hook only after SidebarProvider so context is available */}
            <SidebarHoverLogic
                totalEmployee={totalEmployee}
                totalDepartment={totalDepartment}
                totalLeave={totalLeave}
                pendingLeave={pendingLeave}
                leavesPerMonth={leavesPerMonth}
                leaveTypes={leaveTypes}
                months={months}
                loading={loading}
                handleMonthsChange={handleMonthsChange}
                userRole={userRole}
                isSupervisor={isSupervisor}
                isSuperAdmin={isSuperAdmin}
                supervisedDepartments={supervisedDepartments}
                supervisorEmployees={supervisorEmployees}
            />
        </SidebarProvider>
    );
}

// SidebarHoverLogic is a helper component to keep the main export clean and context usage correct
function SidebarHoverLogic(
    props: Props & { months: number; loading: boolean; handleMonthsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void },
) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();

    // Get role-specific labels and descriptions
    const getRoleSpecificContent = () => {
        if (props.isSupervisor) {
            return {
                title: 'Supervisor Dashboard',
                subtitle: `Managing ${props.supervisedDepartments.join(', ')} department${props.supervisedDepartments.length > 1 ? 's' : ''}`,
                employeeLabel: 'Your Employees',
                departmentLabel: 'Your Departments',
                leaveLabel: 'Your Department Leaves',
                pendingLabel: 'Pending Leaves',
            };
        } else if (props.isSuperAdmin) {
            return {
                title: 'Super Admin Dashboard',
                subtitle: 'Manage your entire organization',
                employeeLabel: 'Total Employees',
                departmentLabel: 'Total Departments',
                leaveLabel: 'Total Leaves',
                pendingLabel: 'Pending Leaves',
            };
        } else {
            return {
                title: 'Dashboard',
                subtitle: "Manage your organization's workforce",
                employeeLabel: 'Total Employees',
                departmentLabel: 'Total Departments',
                leaveLabel: 'Total Leaves',
                pendingLabel: 'Pending Leaves',
            };
        }
    };

    const roleContent = getRoleSpecificContent();

    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            <SidebarInset>
                <SiteHeader breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]} title={''} />
                {props.loading ? (
                    <ContentLoading />
                ) : (
                    <>
                        <Main>
                            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                <div>
                                    <div className="ms-2 flex items-center">
                                        <LayoutGrid className="size-11" />
                                        <div className="ms-2">
                                            <h2 className="flex text-2xl font-bold tracking-tight">{roleContent.title}</h2>
                                            <p className="text-muted-foreground">{roleContent.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Role indicator badge */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                                            props.isSupervisor
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : props.isSuperAdmin
                                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}
                                    >
                                        {props.userRole}
                                    </div>
                                    {props.isSupervisor && props.supervisedDepartments.length > 0 && (
                                        <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {props.supervisedDepartments.length} Dept{props.supervisedDepartments.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Debug information for supervisors
                            {props.isSupervisor && (
                                <div className="mb-4 rounded bg-blue-50 p-4 text-sm">
                                    <div className="font-medium text-blue-800">Supervisor Dashboard Info:</div>
                                    <div className="text-blue-700">
                                        <div>• Supervised Departments: {props.supervisedDepartments.join(', ') || 'None'}</div>
                                        <div>• Total Employees: {props.totalEmployee}</div>
                                        <div>• Total Departments: {props.totalDepartment}</div>
                                        <div>• Employees to Display: {props.supervisorEmployees?.length || 0}</div>
                                    </div>
                                </div>
                            )} */}
                            <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                                <div className="mt-2 w-full overflow-x-auto pb-2">
                                    <TabsList className="gap-2">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="flex flex-1 flex-col">
                                        <div className="relative flex flex-1 flex-col">
                                            <div className="@container/main flex flex-1 flex-col gap-2">
                                                <div className="flex flex-col">
                                                    <SectionCards
                                                        totalEmployee={props.totalEmployee}
                                                        totalDepartment={props.totalDepartment}
                                                        totalLeave={props.totalLeave}
                                                        pendingLeave={props.pendingLeave}
                                                        isSupervisor={props.isSupervisor}
                                                        roleContent={roleContent}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="shadow-sm" />
                                    <ChartAreaInteractive />
                                    <div className="grid grid-cols-3 grid-rows-2 gap-2">
                                        <div className="col-span-2">
                                            <Card className="p-5">
                                                <div className="mb-4 flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                                    <h3 className="font-semibold">
                                                        {props.isSupervisor ? 'Your Department Leave Trends' : 'Leave Trends'}
                                                    </h3>
                                                </div>
                                                <div className="mb-4 flex items-center gap-2">
                                                    <label htmlFor="months-select" className="font-medium">
                                                        Show last
                                                    </label>
                                                    <select
                                                        id="months-select"
                                                        value={props.months}
                                                        onChange={props.handleMonthsChange}
                                                        className="rounded border px-2 py-1"
                                                    >
                                                        <option value={3}>3 months</option>
                                                        <option value={6}>6 months</option>
                                                        <option value={12}>12 months</option>
                                                    </select>
                                                </div>
                                                <ChartBarLabel chartData={props.leavesPerMonth} />
                                            </Card>
                                        </div>
                                        <div className="col-start-3 row-span-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>{props.isSupervisor ? 'Your Top Employees' : 'Top Employees'}</CardTitle>
                                                    <CardDescription>
                                                        {props.isSupervisor
                                                            ? `Performance overview for ${props.supervisedDepartments.join(', ')} department${props.supervisedDepartments.length > 1 ? 's' : ''}`
                                                            : 'Organization-wide performance overview'}
                                                    </CardDescription>
                                                    <SidebarSeparator />
                                                </CardHeader>
                                                <CardContent>
                                                    <RecentSales supervisorEmployees={props.supervisorEmployees} isSupervisor={props.isSupervisor} />
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="row-start-2">
                                            <ChartBarLabels />
                                        </div>
                                        <div className="row-start-2">
                                            <ChartLineLabel />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="analytics" className="space-y-4">
                                    <div className="flex flex-1 flex-col">
                                        <div className="relative flex flex-1 flex-col">
                                            <div className="@container/main flex flex-1 flex-col gap-2">
                                                <div className="flex flex-col">
                                                    <h1>No Idea</h1>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="shadow-sm" />
                                    <ChartAreaInteractive />
                                    <div className="grid grid-cols-3 grid-rows-2 gap-2">
                                        <div className="col-span-2">
                                            <Card className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <label htmlFor="months-select" className="font-medium">
                                                        Show last
                                                    </label>
                                                    <select
                                                        id="months-select"
                                                        value={props.months}
                                                        onChange={props.handleMonthsChange}
                                                        className="rounded border px-2 py-1"
                                                    >
                                                        <option value={3}>3 months</option>
                                                        <option value={6}>6 months</option>
                                                        <option value={12}>12 months</option>
                                                    </select>
                                                </div>
                                                <ChartBarLabel chartData={props.leavesPerMonth} />
                                            </Card>
                                        </div>
                                        <div className="col-start-3 row-span-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Top Employee</CardTitle>
                                                    <CardDescription>You made 265 sales this month.</CardDescription>
                                                    <SidebarSeparator />
                                                </CardHeader>
                                                <CardContent>
                                                    <RecentSales />
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="row-start-2">
                                            <ChartBarLabels />
                                        </div>
                                        <div className="row-start-2">
                                            <ChartLineLabel />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Main>
                    </>
                )}
            </SidebarInset>
        </>
    );
}
