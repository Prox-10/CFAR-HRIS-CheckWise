import { Head } from '@inertiajs/react';

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

interface AttendancePageProps {
    employee: Employee;
}

export default function AttendancePage({ employee }: AttendancePageProps) {
    return (
        <>
            <Head title="Attendance" />
            <div className="flex h-screen bg-gray-50">
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-6 overflow-auto">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance</h1>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-gray-600">Attendance functionality coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 