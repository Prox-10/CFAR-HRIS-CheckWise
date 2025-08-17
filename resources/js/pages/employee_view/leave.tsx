import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { EmployeeLayout } from './components/layout/employee-layout';

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

interface LeaveFormData {
    leave_type: string;
    date_from: string;
    date_to: string;
    reason: string;
}

interface LeavePageProps {
    employee: Employee;
    leaveBalance?: number;
}

const leaveTypes = [
    { value: 'vacation', label: 'Vacation Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'maternity', label: 'Maternity/Paternity Leave' },
    { value: 'other', label: 'Other' },
];

// Credit Display Component for Employee
function EmployeeCreditDisplay({ leaveBalance = 12 }: { leaveBalance: number }) {
    const percentage = Math.round((leaveBalance / 12) * 100);

    const getCreditStatus = () => {
        if (leaveBalance === 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle };
        if (leaveBalance <= 3) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle };
        if (leaveBalance <= 6) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Calendar };
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
    };

    const status = getCreditStatus();
    const IconComponent = status.icon;

    return (
        <Card className={`${status.bg} ${status.border} mb-6 border-2`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className={`h-5 w-5 ${status.color}`} />
                        <CardTitle className={`text-lg ${status.color}`}>Your Leave Credits</CardTitle>
                    </div>
                    <div className="text-main text-2xl font-bold">{leaveBalance}/12</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Credit Usage</span>
                        <span className="text-muted-foreground">{percentage}% remaining</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div className="bg-main h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Remaining</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{leaveBalance}</div>
                        <div className="text-xs text-muted-foreground">credits available</div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Used</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{12 - leaveBalance}</div>
                        <div className="text-xs text-muted-foreground">credits used</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconComponent className="h-3 w-3" />
                    {leaveBalance === 0 && 'No credits remaining'}
                    {leaveBalance <= 3 && leaveBalance > 0 && 'Low credits remaining'}
                    {leaveBalance <= 6 && leaveBalance > 3 && 'Moderate credits remaining'}
                    {leaveBalance > 6 && 'Good credit balance'}
                </div>
            </CardContent>
        </Card>
    );
}

export default function LeavePage({ employee, leaveBalance = 12 }: LeavePageProps) {
    const [formData, setFormData] = useState<LeaveFormData>({
        leave_type: '',
        date_from: '',
        date_to: '',
        reason: '',
    });

    const handleLogout = () => {
        router.post(
            route('employee_logout'),
            {},
            {
                onSuccess: () => {
                    window.location.href = route('employee_login');
                },
                onError: () => {
                    window.location.href = route('employee_login');
                },
            },
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement leave request submission
        console.log('Submitting leave request:', formData);
        alert('Leave request submitted successfully!');
    };

    const handleClearForm = () => {
        setFormData({
            leave_type: '',
            date_from: '',
            date_to: '',
            reason: '',
        });
    };

    const calculateLeaveDays = () => {
        if (!formData.date_from || !formData.date_to) return 0;
        const start = new Date(formData.date_from);
        const end = new Date(formData.date_to);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1; // Include both start and end dates
    };

    return (
        <>
            <Head title="Leave Form" />
            <EmployeeLayout employee={employee} currentPage="leave form" onLogout={handleLogout}>
                {/* Page Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                        <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
                        <p className="text-gray-600">Submit your leave request for approval</p>
                    </div>
                </div>

                {/* Credit Display */}
                <EmployeeCreditDisplay leaveBalance={leaveBalance} />

                {/* Leave Application Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Leave Application Form</CardTitle>
                        <CardDescription>Please fill out all required information for your leave request</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Leave Type */}
                            <div className="space-y-2">
                                <Label htmlFor="leave_type" className="text-sm font-medium">
                                    Leave Type *
                                </Label>
                                <Select
                                    value={formData.leave_type || undefined}
                                    onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date_from" className="text-sm font-medium">
                                        Date From *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="date_from"
                                            type="date"
                                            value={formData.date_from}
                                            onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                                            required
                                        />
                                        <Calendar className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_to" className="text-sm font-medium">
                                        Date To *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="date_to"
                                            type="date"
                                            value={formData.date_to}
                                            onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                                            min={formData.date_from}
                                            required
                                        />
                                        <Calendar className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-sm font-medium">
                                    Reason for Leave *
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a detailed reason for your leave request..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Leave Policy Reminder */}
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                    <div>
                                        <h4 className="mb-2 font-medium text-yellow-800">Leave Policy Reminder:</h4>
                                        <ul className="space-y-1 text-sm text-yellow-700">
                                            <li>• Submit leave requests at least 2 weeks in advance when possible</li>
                                            <li>• Sick leave requires medical documentation for absences over 3 days</li>
                                            <li>• Emergency leave should be reported as soon as possible</li>
                                            <li>• Current leave balance: {leaveBalance} credits remaining</li>
                                            {calculateLeaveDays() > 0 && (
                                                <li>
                                                    • Requested credits: {calculateLeaveDays()} credits ({calculateLeaveDays()} days)
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    Submit Leave Request
                                </Button>
                                <Button type="button" variant="outline" onClick={handleClearForm}>
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </EmployeeLayout>
        </>
    );
}
