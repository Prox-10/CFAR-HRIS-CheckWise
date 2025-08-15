import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';

interface SectionCardsProps {
    leaveStats: {
        totalLeaves: number;
        approvedLeaves: number;
        rejectedLeaves: number;
        pendingLeaves: number;
        cancelledLeaves: number;
    };
    isSupervisor?: boolean;
    roleContent?: {
        totalLabel: string;
        approvedLabel: string;
        pendingLabel: string;
        rejectedLabel: string;
    };
}

export function SectionCards({
    leaveStats = {
        totalLeaves: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0,
        pendingLeaves: 0,
        cancelledLeaves: 0,
    },
    isSupervisor = false,
    roleContent,
}: SectionCardsProps) {
    const { totalLeaves, approvedLeaves, rejectedLeaves, pendingLeaves, cancelledLeaves } = leaveStats;
    const totalLeavesCount = useCountUp(totalLeaves, 1000);
    const approvedLeavesCount = useCountUp(approvedLeaves, 1000);
    const pendingLeavesCount = useCountUp(pendingLeaves, 1000);
    const rejectedLeavesCount = useCountUp(rejectedLeaves, 1000);
    const cancelledLeavesCount = useCountUp(cancelledLeaves, 1000);
    const rejectedAndCancelledCount = useCountUp(rejectedLeaves + cancelledLeaves, 1000);

    // Default labels
    const labels = roleContent || {
        totalLabel: 'Total Leaves',
        approvedLabel: 'Approved',
        pendingLabel: 'Pending',
        rejectedLabel: 'Rejected / Cancelled',
    };

    // Get badge text based on role
    const getBadgeText = (type: string) => {
        if (isSupervisor) {
            switch (type) {
                case 'total':
                    return 'Your';
                case 'approved':
                    return 'Your';
                case 'pending':
                    return 'Your';
                case 'rejected':
                    return 'Your';
                default:
                    return 'Total';
            }
        }
        return type === 'pending' ? 'Pending' : 'Total';
    };

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            {/* Total Leaves */}
            <Card className="@container/card border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-green-100 p-2">
                            <FileText className="size-6 text-green-600" />
                        </div>
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            {getBadgeText('total')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-green-700">{labels.totalLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-800 tabular-nums @[250px]/card:text-4xl">{totalLeavesCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-green-600">
                        <FileText className="size-4" />
                        {isSupervisor ? 'Your leave requests' : 'Total leave requests'}
                    </div>
                    <div className="text-green-500">{isSupervisor ? 'Your applications' : 'All time'}</div>
                </CardFooter>
            </Card>

            {/* Approved Leaves */}
            <Card className="@container/card border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <CheckCircle className="size-6 text-emerald-600" />
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {getBadgeText('approved')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-emerald-700">{labels.approvedLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-emerald-800 tabular-nums @[250px]/card:text-4xl">{approvedLeavesCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600">
                        <CheckCircle className="size-4" />
                        {isSupervisor ? 'Your approved leaves' : 'Approved leaves'}
                    </div>
                    <div className="text-emerald-500">{isSupervisor ? 'Successfully processed' : 'Successfully processed'}</div>
                </CardFooter>
            </Card>

            {/* Pending Leaves */}
            <Card className="@container/card border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-amber-100 p-2">
                            <Clock className="size-6 text-amber-600" />
                        </div>
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                            {getBadgeText('pending')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-amber-700">{labels.pendingLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-amber-800 tabular-nums @[250px]/card:text-4xl">{pendingLeavesCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-amber-600">
                        <Clock className="size-4" />
                        {isSupervisor ? 'Your pending approval' : 'Pending approval'}
                    </div>
                    <div className="text-amber-500">{isSupervisor ? 'Requires your review' : 'Awaiting action'}</div>
                </CardFooter>
            </Card>

            {/* Rejected & Cancelled Leaves */}
            <Card className="@container/card border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-red-100 p-2">
                            <XCircle className="size-6 text-red-600" />
                        </div>
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                            {getBadgeText('rejected')}
                        </Badge>
                    </div>
                    <CardDescription className="mt-3 font-semibold text-red-700">{labels.rejectedLabel}</CardDescription>
                    <CardTitle className="text-3xl font-bold text-red-800 tabular-nums @[250px]/card:text-4xl">{rejectedAndCancelledCount}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium text-red-600">
                        <XCircle className="size-4" />
                        {isSupervisor ? 'Your rejected/cancelled' : `Rejected: ${rejectedLeavesCount} | Cancelled: ${cancelledLeavesCount}`}
                    </div>
                    <div className="text-red-500">{isSupervisor ? 'Your not approved or withdrawn' : 'Not approved or withdrawn'}</div>
                </CardFooter>
            </Card>
        </div>
    );
}
