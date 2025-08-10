import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface Activity {
    id: string;
    title: string;
    timeAgo: string;
    status: 'approved' | 'pending' | 'completed';
}

interface RecentActivitiesProps {
    activities: Activity[];
}

const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
        case 'approved':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'pending':
            return <AlertCircle className="h-4 w-4 text-yellow-600" />;
        case 'completed':
            return <FileText className="h-4 w-4 text-gray-600" />;
        default:
            return <Clock className="h-4 w-4 text-gray-600" />;
    }
};

const getStatusBadge = (status: Activity['status']) => {
    const variants = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-gray-100 text-gray-800',
    };

    return <Badge className={`text-xs ${variants[status]}`}>{status}</Badge>;
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
    return (
        <Card className="bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(activity.status)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                                    </div>
                                </div>
                                {getStatusBadge(activity.status)}
                            </div>
                        ))
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-sm text-gray-500">No recent activities</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
