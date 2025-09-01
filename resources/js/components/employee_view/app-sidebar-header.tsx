import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
    const { unreadNotificationCount = 0, notifications = [] } = usePage().props as any;
    const [showNotifications, setShowNotifications] = useState(false);

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await router.post(
                '/employee/notifications/mark-read',
                { notification_id: notificationId },
                {
                    preserveScroll: true,
                    onSuccess: () => {},
                },
            );
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await router.post(
                '/employee/notifications/mark-all-read',
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('All notifications marked as read');
                    },
                },
            );
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[sidebar-wrapper]:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                    {/* Notification Bell Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="hover:bg-sidebar-hover relative h-10 w-10 rounded-full p-0"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                            </span>
                        )}
                    </Button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-12 right-0 z-[1000] w-80 rounded-lg border bg-white p-4 shadow-lg">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadNotificationCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllNotificationsAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                                {notifications && notifications.length > 0 ? (
                                    notifications.map((notification: any) => (
                                        <div
                                            key={notification.id}
                                            className={`cursor-pointer rounded-lg border p-3 ${
                                                notification.read_at ? 'bg-gray-50' : 'border-blue-200 bg-blue-50'
                                            }`}
                                            onClick={() => !notification.read_at && markNotificationAsRead(notification.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.type === 'leave_request' && 'Leave Request Update'}
                                                        {notification.type === 'absence_request' && 'Absence Request Update'}
                                                        {notification.type === 'evaluation' && 'Evaluation Update'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-600">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No notifications</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
