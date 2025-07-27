import { BellNotification } from '@/components/customize/bell-notification';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import { ProfileDropdown } from '@/components/customize/profile-dropdown';
import { usePage } from '@inertiajs/react';
import React from 'react';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
    fixed?: boolean;
    ref?: React.Ref<HTMLElement>;
}

export const Header = ({ className, fixed, children, ...props }: HeaderProps) => {
    const [offset, setOffset] = React.useState(0);
    const { notifications = [], unreadNotificationCount = 0 } = usePage().props as any;
    const [unreadCount, setUnreadCount] = React.useState(unreadNotificationCount);
    const [notificationList, setNotificationList] = React.useState(notifications);

    React.useEffect(() => {
        setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    }, []);
    React.useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };

        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true });

        // Clean up the event listener on unmount
        return () => document.removeEventListener('scroll', onScroll);
    }, []);
    React.useEffect(() => {
        const onResize = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };

        // Add resize listener to the body
        window.addEventListener('resize', onResize, { passive: true });

        // Clean up the event listener on unmount
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Update state when page props change
    React.useEffect(() => {
        setUnreadCount(unreadNotificationCount);
        setNotificationList(notifications);
    }, [notifications, unreadNotificationCount]);

    const handleNotificationRead = (id: number) => {
        setNotificationList((prev) => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <header
            className={cn(
                'flex h-16 items-center gap-3 bg-background p-4 sm:gap-4',
                fixed && 'w-inherit header-fixed peer/header fixed z-50 rounded-md',
                offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
                className,
            )}
            {...props}
        >
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <div className="mr-auto flex items-center space-x-4">
                <BellNotification notifications={notificationList} unreadCount={unreadCount} onNotificationRead={handleNotificationRead} />
                <ProfileDropdown />
            </div>
            {children}
        </header>
    );
};

Header.displayName = 'Header';
