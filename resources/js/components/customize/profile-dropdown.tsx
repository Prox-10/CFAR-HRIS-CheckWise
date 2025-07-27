
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CircleProfile } from '@/components/customize/circle-profile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserMenuContent } from './user-menu-content';


export function ProfileDropdown() {
      const { auth } = usePage<SharedData>().props;
       const { state } = useSidebar();
       const isMobile = useIsMobile();
  return (
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                  <CircleProfile user={auth.user} />
                  {/* <ChevronsUpDown className="ml-auto size-4" /> */}
              </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="end"
              side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
          >
              <UserMenuContent user={auth.user} />
          </DropdownMenuContent>
      </DropdownMenu>
  );
}
