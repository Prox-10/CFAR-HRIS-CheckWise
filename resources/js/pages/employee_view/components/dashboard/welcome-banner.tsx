import { User } from 'lucide-react';

interface WelcomeBannerProps {
    employee: {
        employee_name: string;
        employeeid: string;
        picture?: string;
    };
}

export function WelcomeBanner({ employee }: WelcomeBannerProps) {
    return (
        <div className="rounded-lg bg-green-600 p-6 text-white">
            <div className="flex items-center gap-4">
                {employee.picture ? (
                    <img src={employee.picture} alt={employee.employee_name} className="h-16 w-16 rounded-full border-2 border-white object-cover" />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-green-500">
                        <User className="h-8 w-8 text-white" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {employee.employee_name}!</h1>
                    <p className="text-green-100">Employee ID: {employee.employeeid} • CFARBEMPCO</p>
                </div>
            </div>
        </div>
    );
}
