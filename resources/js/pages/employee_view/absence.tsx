import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { Calendar, Info, UserX } from 'lucide-react';
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

interface AbsenceFormData {
    date_of_absence: string;
    reason: string;
}

interface AbsencePageProps {
    employee: Employee;
}

export default function AbsencePage({ employee }: AbsencePageProps) {
    const [formData, setFormData] = useState<AbsenceFormData>({
        date_of_absence: '',
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
        // TODO: Implement absence form submission
        console.log('Submitting absence form:', formData);
        alert('Absence notification submitted successfully!');
    };

    const handleClearForm = () => {
        setFormData({
            date_of_absence: '',
            reason: '',
        });
    };

    return (
        <>
            <Head title="Absence Form" />
            <EmployeeLayout employee={employee} currentPage="absence form" onLogout={handleLogout}>
                {/* Submit Absence Notification Banner */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                        <UserX className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Submit Absence Notification</h1>
                        <p className="text-gray-600">Report your absence to HR</p>
                    </div>
                </div>

                {/* Information/Warning Box */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 text-gray-600" />
                        <div className="text-sm text-gray-700">
                            Please submit absence notifications as soon as possible. For emergencies, contact your supervisor directly at
                            +63-XXX-XXX-XXXX.
                        </div>
                    </div>
                </div>

                {/* Absence Notification Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Absence Notification Form</CardTitle>
                        <CardDescription>Please provide details about your absence</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date of Absence */}
                            <div className="space-y-2">
                                <Label htmlFor="date_of_absence" className="text-sm font-medium">
                                    Date of Absence *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="date_of_absence"
                                        type="date"
                                        value={formData.date_of_absence}
                                        onChange={(e) => setFormData({ ...formData, date_of_absence: e.target.value })}
                                        required
                                    />
                                    <Calendar className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                </div>
                            </div>

                            {/* Reason for Absence */}
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-sm font-medium">
                                    Reason for Absence *
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a detailed reason for your absence..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Absence Policy */}
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <h4 className="mb-2 font-medium text-yellow-800">Absence Policy:</h4>
                                <ul className="space-y-1 text-sm text-yellow-700">
                                    <li>• Report absences before your scheduled shift when possible</li>
                                    <li>• Medical documentation may be required for consecutive absences</li>
                                    <li>• Frequent unexcused absences may affect your employment status</li>
                                    <li>• Contact your supervisor for urgent situations</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    disabled={!formData.date_of_absence || !formData.reason}
                                >
                                    Submit Absence Form
                                </Button>
                                <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1">
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
