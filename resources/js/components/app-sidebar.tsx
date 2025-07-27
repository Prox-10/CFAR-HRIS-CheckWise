import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    ClipboardList,
    Command,
    Frame,
    GalleryVerticalEnd,
    LayoutDashboard,
    LayoutGrid,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    User2,
    Fingerprint,
    CalendarPlus2,
    FileChartColumnIncreasing,
    ShieldCheck,
    NotebookPen
   
} from 'lucide-react';
import { Link } from '@inertiajs/react';

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { type NavItem } from '@/types';
import { NavSidebar } from "./nav-sidebar"
import { User } from "./user";
import AppLogo from "./customize/app-logo";

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
        title: 'Service Tenure',
        href: '/service-tenure',
        icon: CalendarPlus2,
    },
    // {
    //     title: 'Test',
    //     href: '/test',
    //     icon: CalendarPlus2,

    // },
    {
        title: 'Reports',
        href: '/report',
        icon: FileChartColumnIncreasing,
    },
];

// const data = {
  
//     navMain: [
//         {
//             title: 'Permission',
//             url: '#',
//             icon: ShieldCheck,
//             isActive: false,
//             items: [
//                 {
//                     title: 'History',
//                     url: '#',
//                 },
//                 {
//                     title: 'Starred',
//                     url: '#',
//                 },
//                 {
//                     title: 'Settings',
//                     url: '#',
//                 },
//             ],
//         },
//     ],
// };


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
              {/* <NavMain items={data.navMain} /> */}

              <User />
          </SidebarFooter>
          <SidebarRail />
      </Sidebar>
  );
}
