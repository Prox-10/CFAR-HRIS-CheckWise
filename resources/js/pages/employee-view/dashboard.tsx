import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Bell, Calendar, Clock, FileText, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PerformanceOverview } from './components/performance-overview';
import { RecentActivities } from './components/recent-activities';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/employee-view',
    },
];

interface Employee {
    id: number;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface DashboardData {
    leaveBalance: number;
    absenceCount: number;
    evaluationRating: number;
    assignedArea: string;
    attendancePercentage: number;
    productivity: number;
    recentActivities: Array<{
        id: string;
        title: string;
        timeAgo: string;
        status: string;
    }>;
    // Enhanced data
    leaveCredits: {
        remaining: number;
        used: number;
        total: number;
    };
    absenceCredits: {
        remaining: number;
        used: number;
        total: number;
    };
    leaveRequests: Array<{
        id: number;
        leave_type: string;
        leave_start_date: string;
        leave_end_date: string;
        leave_days: number;
        leave_status: string;
        leave_reason: string;
        created_at: string;
    }>;
    absenceRequests: Array<{
        id: number;
        absence_type: string;
        from_date: string;
        to_date: string;
        days: number;
        status: string;
        reason: string;
        created_at: string;
    }>;
    notifications: Array<{
        id: string;
        type: string;
        data: any;
        read_at: string | null;
        created_at: string;
    }>;
    unreadNotificationCount: number;
}

interface DashboardProps {
    employee: Employee;
    dashboardData: DashboardData;
}

export default function Dashboard({ employee, dashboardData }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState(dashboardData.notifications || []);
    const [unreadCount, setUnreadCount] = useState(dashboardData.unreadNotificationCount || 0);
    const [showNotifications, setShowNotifications] = useState(false);

    const currentTime = new Date();
    const hour = currentTime.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
    } else if (hour >= 17) {
        greeting = 'Good evening';
    }
    const dateStr = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Refresh data periodically
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/employee/dashboard/refresh');
                if (response.ok) {
                    const data = await response.json();
                    // Update local state with fresh data
                    setNotifications(data.dashboardData.notifications || []);
                    setUnreadCount(data.dashboardData.unreadNotificationCount || 0);
                }
            } catch (error) {
                console.error('Failed to refresh dashboard data:', error);
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await router.post(
                '/employee/notifications/mark-read',
                { notification_id: notificationId },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)));
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    },
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
                        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
                        setUnreadCount(0);
                        toast.success('All notifications marked as read');
                    },
                },
            );
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return <UserCheck className="h-4 w-4 text-green-600" />;
            case 'rejected':
                return <X className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <FileText className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Dashboard" />

            <div className="space-y-6">
                {/* Welcome Banner with Notification Bell */}
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    <GradientBackground className="absolute inset-0" />
                    <div className="relative z-10 h-full w-full p-6">
                        <div className="flex justify-end absolute top-2 right-2">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </Button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute top-12 right-0 w-80 rounded-lg border bg-white p-4 shadow-lg z-[1000]">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
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
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`rounded-lg border p-3 ${
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
                        <div className="flex h-full items-center justify-between text-white">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-24 w-24 border-2 border-cfar-500">
                                    <AvatarImage
                                        src={employee.picture || '/Logo.png'}
                                        alt={employee.employee_name}
                                        onError={(e) => {
                                            e.currentTarget.src = '/Logo.png';
                                        }}
                                    />
                                </Avatar>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold">
                                        {greeting}, {employee.firstname}!
                                    </h1>
                                    <p className="text-sm text-white/80">Welcome back to your dashboard</p>
                                    <div className="mt-2 flex items-center space-x-3">
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                            {employee.position}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                            {employee.department}
                                        </Badge>
                                        <span className="text-sm text-white/60">ID: {employee.employeeid}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Notification Bell */}

                                <div className="text-right">
                                    <p className="text-sm text-white/80">Today</p>
                                    <p className="text-lg font-semibold">{dateStr}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Metrics Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Leave Credits */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leave Credits</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {dashboardData.leaveCredits?.remaining || dashboardData.leaveBalance}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardData.leaveCredits?.used || 0} used of {dashboardData.leaveCredits?.total || 15} total
                            </p>
                        </CardContent>
                    </Card>

                    {/* Absence Credits */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Absence Credits</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{dashboardData.absenceCredits?.remaining || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardData.absenceCredits?.used || 0} used of {dashboardData.absenceCredits?.total || 0} total
                            </p>
                        </CardContent>
                    </Card>

                    {/* Leave Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{dashboardData.leaveRequests?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardData.leaveRequests?.filter((l) => l.leave_status === 'Pending').length || 0} pending
                            </p>
                        </CardContent>
                    </Card>

                    {/* Absence Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Absence Requests</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{dashboardData.absenceRequests?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {dashboardData.absenceRequests?.filter((a) => a.status === 'pending').length || 0} pending
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Overview, Leave Requests, and Absence Requests */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
                        <TabsTrigger value="absences">Absence Requests</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <PerformanceOverview dashboardData={dashboardData} />
                            <RecentActivities activities={dashboardData.recentActivities} />
                        </div>
                    </TabsContent>

                    <TabsContent value="leaves" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Requests</CardTitle>
                                <CardDescription>Track your leave request status and history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dashboardData.leaveRequests && dashboardData.leaveRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {dashboardData.leaveRequests.map((leave) => (
                                            <div key={leave.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h4 className="font-medium">{leave.leave_type}</h4>
                                                        <Badge className={getStatusColor(leave.leave_status)}>
                                                            {getStatusIcon(leave.leave_status)}
                                                            <span className="ml-1">{leave.leave_status}</span>
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {new Date(leave.leave_start_date).toLocaleDateString()} -{' '}
                                                        {new Date(leave.leave_end_date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{leave.leave_days} days</p>
                                                    {leave.leave_reason && <p className="mt-1 text-sm text-gray-500">"{leave.leave_reason}"</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{new Date(leave.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <p className="text-gray-500">No leave requests found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="absences" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Absence Requests</CardTitle>
                                <CardDescription>Track your absence request status and history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dashboardData.absenceRequests && dashboardData.absenceRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {dashboardData.absenceRequests.map((absence) => (
                                            <div key={absence.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h4 className="font-medium">{absence.absence_type}</h4>
                                                        <Badge className={getStatusColor(absence.status)}>
                                                            {getStatusIcon(absence.status)}
                                                            <span className="ml-1">{absence.status}</span>
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {new Date(absence.from_date).toLocaleDateString()} -{' '}
                                                        {new Date(absence.to_date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{absence.days} days</p>
                                                    {absence.reason && <p className="mt-1 text-sm text-gray-500">"{absence.reason}"</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{new Date(absence.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <p className="text-gray-500">No absence requests found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
