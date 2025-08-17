import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { BellIcon } from 'lucide-react';

export function BellNotification({
    notifications = [],
    unreadCount = 0,
    onNotificationRead,
}: {
    notifications?: any[];
    unreadCount?: number;
    onNotificationRead?: (id: number) => void;
}) {
    const handleNotificationClick = async (id: number, unread: boolean, notification: any) => {
        if (unread) {
            try {
                await axios.post(`/api/notifications/${id}/read`);
                if (onNotificationRead) onNotificationRead(id);
            } catch (e) {
                // handle error
            }
        }
        // Navigate to the relevant page based on notification type
        if (notification.type === 'leave_request' && notification.data && notification.data.leave_id) {
            router.visit(`/leave/${notification.data.leave_id}/edit`);
        } else if (notification.type === 'resume_to_work' && notification.data && notification.data.resume_id) {
            router.visit(`/resume-to-work`);
        } else if (notification.type === 'employee_returned') {
            router.visit(`/resume-to-work`);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 p-3">
                    <BellIcon className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {unreadCount} new
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 && <DropdownMenuItem className="justify-center text-center">No notifications</DropdownMenuItem>}
                {notifications.map((notification) => (
                    <DropdownMenuItem
                        key={notification.id}
                        className="flex cursor-pointer flex-col items-start p-3"
                        onClick={() => handleNotificationClick(notification.id, !notification.read_at, notification)}
                    >
                        <div className="flex w-full items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                        {notification.type === 'leave_request'
                                            ? 'New Leave Request'
                                            : notification.type === 'resume_to_work'
                                              ? 'New Resume to Work Request'
                                              : notification.type === 'employee_returned'
                                                ? 'Employee Returned to Work'
                                                : notification.title}
                                    </p>
                                    {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {notification.data && notification.data.employee_name
                                        ? notification.type === 'leave_request'
                                            ? `${notification.data.employee_name} requested ${notification.data.leave_type}`
                                            : notification.type === 'resume_to_work'
                                              ? `${notification.data.employee_name} submitted resume to work form`
                                              : notification.type === 'employee_returned'
                                                ? `${notification.data.employee_name} has returned to work`
                                                : notification.message
                                        : notification.message}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-center">View all notifications</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
