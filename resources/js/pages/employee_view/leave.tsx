import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Calendar } from 'lucide-react';
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
                                            <li>• Current leave balance: {leaveBalance} days remaining</li>
                                            {calculateLeaveDays() > 0 && <li>• Requested days: {calculateLeaveDays()} days</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button 
                                    type="submit" 
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                    disabled={!formData.leave_type || !formData.date_from || !formData.date_to || !formData.reason}
                                >
                                    Submit Leave Request
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleClearForm}
                                    className="flex-1"
                                >
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
