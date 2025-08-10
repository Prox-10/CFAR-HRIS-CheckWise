export interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

export interface Activity {
    id: string;
    title: string;
    timeAgo: string;
    status: 'approved' | 'pending' | 'completed';
}

export interface PerformanceMetrics {
    overallRating: number;
    attendance: number;
    productivity: number;
}

export interface LeaveBalance {
    vacation: number;
    sick: number;
    personal: number;
    total: number;
}

export interface EmployeeMetrics {
    leaveBalance: LeaveBalance;
    absenceCount: number;
    evaluationRating: number;
    assignedArea: string;
    performance: PerformanceMetrics;
    recentActivities: Activity[];
}
