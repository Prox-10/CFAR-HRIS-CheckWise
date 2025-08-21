import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Activity {
    id: string;
    title: string;
    timeAgo: string;
    status: string;
    type?: string;
}

interface RecentActivitiesProps {
    activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
    const getStatusIcon = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <CalendarDays className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'approved':
                return 'approved';
            case 'pending':
                return 'pending';
            case 'rejected':
                return 'rejected';
            case 'completed':
                return 'completed';
            default:
                return status.toLowerCase();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest requests and updates</CardDescription>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>No recent activities to display</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                <div className="flex-shrink-0">{getStatusIcon(activity.status)}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                                </div>
                                <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                                    {getStatusText(activity.status)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
