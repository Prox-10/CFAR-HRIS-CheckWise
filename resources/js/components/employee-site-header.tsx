import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { BellNotification } from './customize/bell-notification';
import { ProfileDropdown } from './customize/profile-dropdown';

// Add BreadcrumbItem type import if not present
import { type BreadcrumbItem } from '@/types';

interface Props {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
}

export function SiteHeader({ title, breadcrumbs }: Props) {
    const { notifications = [], unreadNotificationCount = 0 } = usePage().props as any;
    // Optionally, manage state for immediate UI update as in Header

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-3" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                <div className="flex flex-1 flex-col">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav className="mb-1 text-base font-medium text-muted-foreground">
                            {breadcrumbs.map((crumb, idx) => (
                                <span key={crumb.href}>
                                    <a href={crumb.href} className="hover:underline">
                                        {crumb.title}
                                    </a>
                                    {idx < breadcrumbs.length - 1 && ' / '}
                                </span>
                            ))}
                        </nav>
                    )}
                    <h1 className="text-base font-medium">{title}</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="mr-auto flex items-center space-x-4">
                        {/* <ModeToggle/> */}
                        <BellNotification notifications={notifications} unreadCount={unreadNotificationCount} />
                        <ProfileDropdown />
                    </div>
                    {/* <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                        <a
                            href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            GitHub
                        </a>
                    </Button> */}
                </div>
            </div>
        </header>
    );
}
