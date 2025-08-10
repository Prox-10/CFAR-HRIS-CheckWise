import { EmployeeHeader } from './employee-header';
import { EmployeeSidebar } from './employee-sidebar';
import { AbsenceCountCard, AssignedAreaCard, EvaluationRatingCard, LeaveBalanceCard } from './metrics-card';
import { PerformanceOverview } from './performance-overview';
import { RecentActivities } from './recent-activities';
import { WelcomeBanner } from './welcome-banner';

interface Employee {
    id: string;
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
        status: 'approved' | 'pending' | 'completed';
    }>;
}

interface EmployeeDashboardProps {
    employee: Employee;
    dashboardData: DashboardData;
    onLogout: () => void;
}

export function EmployeeDashboard({ employee, dashboardData, onLogout }: EmployeeDashboardProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <EmployeeSidebar onLogout={onLogout} />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <EmployeeHeader employee={employee} />

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Welcome Banner */}
                        <WelcomeBanner employee={employee} />

                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <LeaveBalanceCard leaveBalance={dashboardData.leaveBalance} />
                            <AbsenceCountCard absenceCount={dashboardData.absenceCount} />
                            <EvaluationRatingCard evaluationRating={dashboardData.evaluationRating} />
                            <AssignedAreaCard assignedArea={dashboardData.assignedArea} />
                        </div>

                        {/* Bottom Row - Recent Activities and Performance Overview */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <RecentActivities activities={dashboardData.recentActivities} />
                            <PerformanceOverview
                                overallRating={dashboardData.evaluationRating}
                                attendance={dashboardData.attendancePercentage}
                                productivity={dashboardData.productivity}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
