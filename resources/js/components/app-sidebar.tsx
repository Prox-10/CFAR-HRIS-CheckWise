import { Link } from '@inertiajs/react';
import {
    Activity,
    CalendarPlus2,
    FileText,
    Fingerprint,
    LayoutGrid,
    NotebookPen,
    ShieldCheck,
    User2
} from 'lucide-react';
import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from "@/components/ui/sidebar";
import { Toaster } from '@/components/ui/sonner';
import { type NavItem } from '@/types';
import AppLogo from "./customize/app-logo";
import { NavSidebar } from "./nav-sidebar";
import { User } from "./user";

// This is sample data.


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: 'view-dashboard',
    },
    {
        title: 'Employee',
        href: '/employee',
        icon: User2,
        permission: 'view-employee',
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: Fingerprint,
        permission: 'view-attendance',
    },
    {
        title: 'Evaluation',
        href: '/evaluation',
        icon: NotebookPen,
        permission: 'view-evaluation',
    },
    {
        title: 'Leave',
        href: '/leave',
        icon: CalendarPlus2,
        permission: 'view-leave',
    },
    // {
    //     title: 'Request Form',
    //     href: '/request-form',
    //     icon: NotepadText,
    //     items: [
    //         {
    //             title: 'Leave Form',
    //             href: '/request-form/leave',
    //         },
    //         {
    //             title: 'Absent Form',
    //             href: '/request-form/absent',
    //         },

    //     ],
    // },

    // {
    //     title: 'Test',
    //     href: '/test',
    //     icon: CalendarPlus2,

    // },
    {
        title: 'Service-Tenure',
        href: '/service-tenure/index',
        icon: Activity,
        permission: 'view-service-tenure',
        items: [
            {
                title: 'Dashboard',
                href: '/service-tenure/index',
                permission: 'view-service-tenure',
            },
            {
                title: 'Employee List',
                href: '/service-tenure/employee',
                permission: 'view-service-tenure',
            },
            {
                title: 'Service Tenure',
                href: '/service-tenure/service-tenure',
                permission: 'view-service-tenure',
            },
            {
                title: 'Pay Advancement',
                href: '/service-tenure/pay-advancement',
                permission: 'view-service-tenure',
            },
            {
                title: 'Report',
                href: '/service-tenure/report',
                permission: 'view-service-tenure',
            },
        ],
    },
    {
        title: 'Reports',
        href: '/report',
        icon: FileText,
        permission: 'view-report',
        items: [
            {
                title: 'Attendance Reports',
                href: '/report/attendance',
                permission: 'view-report',
            },
            {
                title: 'Leave Reports',
                href: '/report/leave',
                permission: 'view-report',
            },
            {
                title: 'Performance Reports',
                href: '/report/performance',
                permission: 'view-report',
            },
            {
                title: 'Analytics',
                href: '/report/analytics',
                permission: 'view-report',
            },
        ],
    },
    {
        title: 'Access Management',
        href: '/permission/access/index',
        icon: ShieldCheck,
        permission: 'view-access',
        items: [
            {
                title: 'User Management',
                href: '/permission/user/index',
                permission: 'view-users',
            },
            {
                title: 'Role Management',
                href: '/permission/role/index',
                permission: 'view-roles',
            },
            {
                title: 'Permission Control',
                href: '/permission/access/index',
                permission: 'view-permissions',
            },
            {
                title: 'Settings',
                href: '/permission/settings',
                permission: 'view-permission-settings',
            },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" variant="inset" {...props}>
            <SidebarHeader className=" bg-cfar-400">
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
                <NavSidebar items={mainNavItems} />

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
