import { Link } from '@inertiajs/react';
import { Activity, CalendarPlus2, FileText, Fingerprint, LayoutGrid, NotebookPen, ShieldCheck, User2 } from 'lucide-react';
import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import AppLogo from './customize/app-logo';
import { NavSidebar } from './nav-sidebar';
import { User } from './user';

// This is sample data.

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: 'View Dashboard',
    },
    {
        title: 'Employee',
        href: '/employee',
        icon: User2,
        permission: 'View Employee',
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: Fingerprint,
        permission: 'View Attendance',
    },
    {
        title: 'Evaluation',
        href: '/evaluation',
        icon: NotebookPen,
        permission: 'View Evaluation',
        items: [
            {
                title: 'Evaluation List',
                href: '/evaluation',
                permission: 'View Evaluation',
            },
            {
                title: 'Department Evaluation',
                href: '/evaluation/department-evaluation',
                permission: 'View Evaluation By Department',
            },
            {
                title: 'Supervisor Management',
                href: '/evaluation/supervisor-management',
                permission: 'View Admin',
            },
        ],
    },
    {
        title: 'Leave',
        href: '/leave',
        icon: CalendarPlus2,
        permission: 'View Leave',
    },
    {
        title: 'Absence',
        href: '/absence',
        icon: CalendarPlus2,
        permission: 'View Absence',
    },
    {
        title: 'Service-Tenure',
        href: '/service-tenure/index',
        icon: Activity,
        permission: 'View Service Tenure Management',
        items: [
            {
                title: 'Dashboard',
                href: '/service-tenure/index',
                permission: 'View Service Tenure Dashboard',
            },
            {
                title: 'Employee List',
                href: '/service-tenure/employee',
                permission: 'View Service Tenure Employee',
            },
            {
                title: 'Service Tenure',
                href: '/service-tenure/service-tenure',
                permission: 'View Service Tenure',
            },
            {
                title: 'Pay Advancement',
                href: '/service-tenure/pay-advancement',
                permission: 'View Service Tenure Pay Advancement',
            },
            {
                title: 'Report',
                href: '/service-tenure/report',
                permission: 'View Service Tenure Report',
            },
        ],
    },
    {
        title: 'Reports',
        href: '/report',
        icon: FileText,
        permission: 'View Report',
        items: [
            {
                title: 'Attendance Reports',
                href: '/report/attendance',
                permission: 'View Report Attendance',
            },
            {
                title: 'Leave Reports',
                href: '/report/leave',
                permission: 'View Report Leave',
            },
            {
                title: 'Performance Reports',
                href: '/report/performance',
                permission: 'View Report Performance',
            },
            {
                title: 'Analytics',
                href: '/report/analytics',
                permission: 'View Report Analytics',
            },
        ],
    },
    {
        title: 'Access Management',
        href: '/permission/access/index',
        icon: ShieldCheck,
        permission: 'View Access',
        items: [
            {
                title: 'Admin Management',
                href: '/permission/user/index',
                permission: 'View Admin',
            },
            {
                title: 'Role Management',
                href: '/permission/role/index',
                permission: 'View Role',
            },
            {
                title: 'Permission Control',
                href: '/permission/access/index',
                permission: 'View Permission',
            },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" variant="inset" {...props}>
            <SidebarHeader className="bg-cfar-400">
                {/* <TeamSwitcher teams={data.teams} /> */}

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto flex-col items-center justify-center gap-1 data-[slot=sidebar-menu-button]:!p-3"
                        >
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="bg-cfar-400">
                <NavSidebar items={mainNavItems} employee_items={[]} />

                {/* <NavMain navItem={data.navItem} /> */}
                {/* <NavProjects projects={data.projects} /> */}
            </SidebarContent>
            <SidebarFooter className="bg-cfar-400">
                {/* <NavUser user={data.user} /> */}
                <User />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
