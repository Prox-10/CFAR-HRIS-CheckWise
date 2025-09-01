import { Separator } from '@/components/ui/separator';
import { usePage } from '@inertiajs/react';
import { BellNotification } from './customize/bell-notification';
import { ProfileDropdown } from './customize/profile-dropdown';

// Add BreadcrumbItem type import if not present
import { type BreadcrumbItem } from '@/types';
import Echo from 'laravel-echo';
import { useEffect, useState } from 'react';
import { SidebarTrigger } from './ui/sidebar';

interface Props {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
}

export function SiteHeader({ title, breadcrumbs }: Props) {
    const { notifications = [], unreadNotificationCount = 0, employee } = usePage().props as any;
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationCount);
    const [notificationList, setNotificationList] = useState<any[]>(notifications);

    useEffect(() => {
        // Listen on the shared admin notifications channel for new requests
        const echo: Echo = (window as any).Echo;
        if (!echo) {
            console.error('Echo not found in window object');
            return;
        }

        console.log('Setting up Echo listeners for notifications channel');

        const adminChannel = echo.channel('notifications');

        // Test connection
        adminChannel.subscribed(() => {
            console.log('Successfully subscribed to notifications channel');
        });

        adminChannel.error((error: any) => {
            console.error('Error with notifications channel:', error);
        });

        adminChannel
            .listen('.LeaveRequested', (e: any) => {
                console.log('Received LeaveRequested event:', e);
                // Create a new notification object
                const newNotification = {
                    id: Date.now(), // Temporary ID
                    type: 'leave_request',
                    data: {
                        leave_id: e.leave_id,
                        employee_name: e.employee_name || 'Employee',
                        leave_type: e.leave_type,
                        leave_start_date: e.leave_start_date,
                        leave_end_date: e.leave_end_date,
                    },
                    read_at: null,
                    created_at: new Date().toISOString(),
                };

                // Add to notification list and increment count
                setNotificationList((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            })
            .listen('.AbsenceRequested', (e: any) => {
                console.log('Received AbsenceRequested event:', e);
                // Create a new notification object
                const newNotification = {
                    id: Date.now(), // Temporary ID
                    type: 'absence_request',
                    data: {
                        absence_id: e.absence_id,
                        employee_name: e.employee_name || 'Employee',
                        absence_type: e.absence_type,
                        from_date: e.from_date,
                        to_date: e.to_date,
                    },
                    read_at: null,
                    created_at: new Date().toISOString(),
                };

                // Add to notification list and increment count
                setNotificationList((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });

        return () => {
            console.log('Cleaning up Echo listeners');
            adminChannel.stopListening('.LeaveRequested');
            adminChannel.stopListening('.AbsenceRequested');
        };
    }, []);

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
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
                        <BellNotification notifications={notificationList} unreadCount={unreadCount} />
                        <ProfileDropdown />
                    </div>
                </div>
            </div>
        </header>
    );
}
