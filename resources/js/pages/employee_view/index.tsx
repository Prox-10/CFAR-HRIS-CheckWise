import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/employee-sidebar';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

// import { Employees } from './components/columns';
import { SiteHeader } from '@/components/employee-site-header';
import { ContentLoading } from '@/components/ui/loading';
import { EmployeeAppSidebar } from '@/components/employee-app-sidebar';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee Dashboard',
        href: '/employee_dashboard',
    },
];



export default function Index() {
   

    return (
        <SidebarProvider>
            <Head title="Employee Dashboard" />
            <Toaster position="top-right" richColors />
           
                    <EmployeeAppSidebar />
                    <SidebarInset>
                        {/* <HeaderShrink/> */}
                        <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                        <Main>
                            <div className="flex flex-col gap-4">
                                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                            </div>
                        </Main>
                    </SidebarInset>
             
        </SidebarProvider>
    );
}
