import { User } from 'lucide-react';

interface EmployeeHeaderProps {
    employee: {
        employee_name: string;
        employeeid: string;
        picture?: string;
    };
}

export function EmployeeHeader({ employee }: EmployeeHeaderProps) {
    return (
        <header className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Title */}
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900">CheckWise HRIS - Employee Portal</h1>
                </div>

                {/* Right side - Employee info */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{employee.employee_name}</p>
                        <p className="text-xs text-gray-600">Employee ID: {employee.employeeid}</p>
                    </div>
                    {employee.picture ? (
                        <img
                            src={employee.picture}
                            alt={employee.employee_name}
                            className="h-8 w-8 rounded-full border-2 border-green-600 object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-600 bg-green-600">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
