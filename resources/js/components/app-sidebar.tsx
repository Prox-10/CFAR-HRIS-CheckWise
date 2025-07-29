import { Link } from '@inertiajs/react';
import {
    Activity,
    CalendarPlus2,
    FileChartColumnIncreasing,
    Fingerprint,
    LayoutGrid,
    NotebookPen,
    NotepadText,
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
    },
    {
        title: 'Employee',
        href: '/employee',
        icon: User2,
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: Fingerprint,
    },
    {
        title: 'Evaluation',
        href: '/evaluation',
        icon: NotebookPen,
    },
    {
        title: 'Leave',
        href: '/leave',
        icon: CalendarPlus2,
    },
    {
        title: 'Request Form',
        href: '/request-form',
        icon: NotepadText,
        items: [
            {
                title: 'Leave Form',
                href: '/request-form/leave',
            },
            {
                title: 'Absent Form',
                href: '/request-form/absent',
            },
           
        ],
    },

    // {
    //     title: 'Test',
    //     href: '/test',
    //     icon: CalendarPlus2,

    // },
    {
        title: 'Service-Tenure',
        href: '/service-tenure/index',
        icon: Activity,
        items: [
            {
                title: 'Dashboard',
                href: '/service-tenure/index',
            },
            {
                title: 'Employee List',
                href: '/service-tenure/employee',
            },
            {
                title: 'Service Tenure',
                href: '/service-tenure/service-tenure',
            },
            {
                title: 'Pay Advancement',
                href: '/service-tenure/pay-advancement',
            },
            {
                title: 'Report',
                href: '/service-tenure/report',
            },
        ],
    },
    {
        title: 'Reports',
        href: '/report',
        icon: FileChartColumnIncreasing,
        items: [
            {
                title: 'Attendance Reports',
                href: '/report/attendance',
            },
            {
                title: 'Leave Reports',
                href: '/report/leave',
            },
            {
                title: 'Performance Reports',
                href: '/report/performance',
            },
            {
                title: 'Analytics',
                href: '/report/analytics',
            },
        ],
    },
    {
        title: 'Permission',
        href: '#',
        icon: ShieldCheck,
        items: [
            {
                title: 'User Management',
                href: '/permission/users',
            },
            {
                title: 'Role Management',
                href: '/permission/roles',
            },
            {
                title: 'Access Control',
                href: '/permission/access',
            },
            {
                title: 'Settings',
                href: '/permission/settings',
            },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
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
