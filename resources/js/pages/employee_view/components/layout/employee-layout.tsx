import { EmployeeSidebar } from '../dashboard/employee-sidebar';
import { EmployeeHeader } from '../dashboard/employee-header';

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

interface EmployeeLayoutProps {
    employee: Employee;
    currentPage?: string;
    onLogout: () => void;
    children: React.ReactNode;
}

export function EmployeeLayout({ employee, currentPage, onLogout, children }: EmployeeLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
                <EmployeeSidebar currentPage={currentPage} onLogout={onLogout} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <EmployeeHeader employee={employee} />

                {/* Page Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
} 