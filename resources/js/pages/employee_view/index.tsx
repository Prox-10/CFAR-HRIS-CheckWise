import { Head, router } from '@inertiajs/react';
import { EmployeeDashboard } from './components/dashboard';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

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

interface EmployeeViewProps {
    employee: Employee;
    dashboardData: DashboardData;
}

export default function Index({ employee, dashboardData }: EmployeeViewProps) {
    const cleanup = useMobileNavigation();
    const isEmployee = 'employeeid' in employee;

    const handleLogout = () => {
        cleanup();
        if (isEmployee) {
            // Employee logout
            router.post(route('employee_logout'));
        } else {
            // Regular user logout
            router.flushAll();
        }
    };

    return (
        <>
            <Head title="Employee Dashboard" />
            <EmployeeDashboard employee={employee} dashboardData={dashboardData} onLogout={handleLogout} />
        </>
    );
}
