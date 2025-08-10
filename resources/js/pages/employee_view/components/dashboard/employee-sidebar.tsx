import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Calendar, FileText, LayoutDashboard, LogOut, RotateCcw, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EmployeeSidebarProps {
    currentPage?: string;
    onLogout: () => void;
}

const navigationItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/employee_view',
        route: 'employee_view',
    },
    {
        title: 'View Evaluation',
        icon: FileText,
        href: '/employee_view/evaluations',
        route: 'employee_view.evaluations',
    },
    {
        title: 'Leave Form',
        icon: Calendar,
        href: '/employee_view/leave',
        route: 'employee_view.leave',
    },
    {
        title: 'Absence Form',
        icon: User,
        href: '/employee_view/absence',
        route: 'employee_view.absence',
    },
    {
        title: 'Return to Work Form',
        icon: RotateCcw,
        href: '/employee_view/return-work',
        route: 'employee_view.return-work',
    },
    {
        title: 'Leave/Absence Records',
        icon: FileText,
        href: '/employee_view/records',
        route: 'employee_view.records',
    },
    {
        title: 'Profile Settings',
        icon: User,
        href: '/employee_view/profile',
        route: 'employee_view.profile',
    },
];

export function EmployeeSidebar({ currentPage = 'dashboard', onLogout }: EmployeeSidebarProps) {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const handleNavigation = (route: string) => {
        router.visit(route);
    };

    return (
        <div className="flex h-full flex-col border-r border-gray-200 bg-white">
            {/* Logo Section */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-600">
                        <span className="text-sm font-bold text-white">CW</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">CheckWise</h1>
                        <p className="text-xs text-gray-600">CFARBEMPCO</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
                <h2 className="mb-4 text-sm font-semibold text-gray-600">Navigation</h2>
                <nav className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        // Determine if this item is active based on current URL path
                        const isActive = currentPath === item.href;

                        return (
                            <Button
                                key={item.title}
                                variant={isActive ? 'default' : 'ghost'}
                                className={cn(
                                    'w-full justify-start gap-3',
                                    isActive ? 'bg-green-600 text-white hover:bg-green-700' : 'text-gray-700 hover:bg-gray-100',
                                )}
                                onClick={() => handleNavigation(item.href)}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Button>
                        );
                    })}
                </nav>
            </div>

            {/* Logout Section */}
            <div className="border-t border-gray-200 p-4">
                <Button variant="ghost" className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100" onClick={onLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
