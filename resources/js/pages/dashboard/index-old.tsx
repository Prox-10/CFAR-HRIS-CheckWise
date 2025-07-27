import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Header } from '@/components/customize/header';
import { Main } from '@/components/customize/main';
import { SectionCards } from './components/section-cards';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Overview } from './components/overview';
import { RecentSales } from './components/recent-sales';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <>
            {/* <SidebarProvider> */}
                {/* <AppSidebar> */}
                {/* </AppSidebar> */}
                <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <Header fixed />

                <Main>
                    <div className="flex items-center justify-between space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    </div>

                    <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                        <div className="mt-2 w-full overflow-x-auto pb-2">
                            <TabsList>
                                <TabsTrigger value="overview">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="analytics" >
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="reports" >
                                    Reports
                                </TabsTrigger>
                                <TabsTrigger value="notifications" >
                                    Notifications
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="overview" className="space-y-4">
                            <div className="flex flex-1 flex-col bg-[#F8FFE5]">
                                <div className="relative flex flex-1 flex-col">
                                    <div className="@container/main flex flex-1 flex-col gap-2">
                                        <div className="flex flex-col bg-[#F8FFE5]">
                                            <SectionCards />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Separator className="shadow-sm" />

                            <div className="no-scrollbar grid grid-cols-1 gap-4 overflow-auto lg:grid-cols-7">
                                <Card className="col-span-1 lg:col-span-4">
                                    <CardHeader>
                                        <CardTitle>Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <Overview />
                                    </CardContent>
                                </Card>
                                <Card className="col-span-1 lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle>Recent Sales</CardTitle>
                                        <CardDescription>You made 265 sales this month.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RecentSales />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Main>
            {/* </SidebarProvider> */}
            </AppLayout>
        </>
    );
}
const topNav = [
    {
        title: 'Overview',
        href: 'dashboard/overview',
        isActive: true,
        disabled: false,
    },
    {
        title: 'Customers',
        href: 'dashboard/customers',
        isActive: false,
        disabled: true,
    },
    {
        title: 'Products',
        href: 'dashboard/products',
        isActive: false,
        disabled: true,
    },
    {
        title: 'Settings',
        href: 'dashboard/settings',
        isActive: false,
        disabled: true,
    },
];