import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Star, UserX } from 'lucide-react';

interface MetricsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    iconColor?: string;
}

export function MetricsCard({ title, value, subtitle, icon, iconColor = 'text-green-600' }: MetricsCardProps) {
    return (
        <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <div className={iconColor}>{icon}</div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}

interface LeaveBalanceCardProps {
    leaveBalance: number;
}

export function LeaveBalanceCard({ leaveBalance }: LeaveBalanceCardProps) {
    return (
        <MetricsCard
            title="Current Leave Balance"
            value={`${leaveBalance} days`}
            subtitle="Vacation days remaining"
            icon={<Calendar className="h-5 w-5" />}
            iconColor="text-green-600"
        />
    );
}

interface AbsenceCountCardProps {
    absenceCount: number;
}

export function AbsenceCountCard({ absenceCount }: AbsenceCountCardProps) {
    return (
        <MetricsCard
            title="Absence Count"
            value={absenceCount}
            subtitle="This month"
            icon={<UserX className="h-5 w-5" />}
            iconColor="text-gray-600"
        />
    );
}

interface EvaluationRatingCardProps {
    evaluationRating: number;
}

export function EvaluationRatingCard({ evaluationRating }: EvaluationRatingCardProps) {
    const hasEvaluation = evaluationRating > 0;
    
    return (
        <MetricsCard
            title="Evaluation Rating"
            value={hasEvaluation ? evaluationRating.toFixed(1) : "No evaluation"}
            subtitle={hasEvaluation ? "Last performance review" : "No evaluation available"}
            icon={<Star className="h-5 w-5" />}
            iconColor={hasEvaluation ? "text-yellow-500" : "text-gray-400"}
        />
    );
}

interface AssignedAreaCardProps {
    assignedArea: string;
}

export function AssignedAreaCard({ assignedArea }: AssignedAreaCardProps) {
    return (
        <MetricsCard
            title="Assigned Area"
            value={assignedArea}
            subtitle="Current work assignment"
            icon={<MapPin className="h-5 w-5" />}
            iconColor="text-blue-600"
        />
    );
}
