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

interface ReportsPageProps {
    employee: Employee;
}

export default function ReportsPage({ employee }: ReportsPageProps) {
    return (
        <>
            <Head title="Reports" />
            <div className="flex h-screen bg-gray-50">
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <div className="mx-auto max-w-4xl">
                            <h1 className="mb-6 text-2xl font-bold text-gray-900">Reports</h1>
                            <div className="rounded-lg bg-white p-6 shadow">
                                <p className="text-gray-600">Reports functionality coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
