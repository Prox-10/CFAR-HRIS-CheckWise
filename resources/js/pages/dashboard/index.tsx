"use client"

import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import * as React from "react";

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
import { LayoutGrid } from 'lucide-react';
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
}

export default function Index({
    totalEmployee,
    totalDepartment,
    totalLeave,
    pendingLeave,
    leavesPerMonth,
    leaveTypes,
    months: monthsProp,
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
            />
        </SidebarProvider>
    );
}

// SidebarHoverLogic is a helper component to keep the main export clean and context usage correct
function SidebarHoverLogic(props: Props & { months: number, loading: boolean, handleMonthsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();

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
                                            <h2 className="flex text-2xl font-bold tracking-tight">Dashboard</h2>
                                            <p className="text-muted-foreground">Manage your organization's workforce</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator className="shadow-sm" />
                                    {/* <ChartAreaInteractive /> */}
                                    <div className="grid grid-cols-3 grid-rows-2 gap-2">
                                        <div className="col-span-2">
                                            <Card className='p-5'>
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
                                        <div className="row-span-2 col-start-3">
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
                                            {/* <ChartBarLabels /> */}
                                        </div>
                                        <div className="row-start-2">
                                            {/* <ChartLineLabel /> */}
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
                                            <Card className='p-5'>
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
                                        <div className="row-span-2 col-start-3">
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
