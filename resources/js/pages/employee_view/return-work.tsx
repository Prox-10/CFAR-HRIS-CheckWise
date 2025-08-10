import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { Calendar, RotateCcw } from 'lucide-react';
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

interface ReturnWorkFormData {
    return_date: string;
    previous_absence_reference: string;
    comments: string;
}

interface ReturnWorkPageProps {
    employee: Employee;
    previousAbsences?: Array<{
        id: string;
        date: string;
        type: string;
        reason: string;
    }>;
}

export default function ReturnWorkPage({ employee, previousAbsences = [] }: ReturnWorkPageProps) {
    const [formData, setFormData] = useState<ReturnWorkFormData>({
        return_date: '',
        previous_absence_reference: '',
        comments: '',
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
        // TODO: Implement return to work form submission
        console.log('Submitting return to work form:', formData);
        alert('Return to work notification submitted successfully!');
    };

    const handleClearForm = () => {
        setFormData({
            return_date: '',
            previous_absence_reference: '',
            comments: '',
        });
    };

    return (
        <>
            <Head title="Return to Work Form" />
            <EmployeeLayout employee={employee} currentPage="return to work form" onLogout={handleLogout}>
                {/* Return to Work Notification Banner */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                        <RotateCcw className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Return to Work Notification</h1>
                        <p className="text-gray-600">Notify HR of your return to work</p>
                    </div>
                </div>

                {/* Return to Work Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Return to Work Form</CardTitle>
                        <CardDescription>Please complete this form to notify HR of your return to work</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date Returning to Work */}
                            <div className="space-y-2">
                                <Label htmlFor="return_date" className="text-sm font-medium">
                                    Date Returning to Work *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="return_date"
                                        type="date"
                                        value={formData.return_date}
                                        onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                                        required
                                    />
                                    <Calendar className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                </div>
                            </div>

                            {/* Previous Absence Reference */}
                            <div className="space-y-2">
                                <Label htmlFor="previous_absence_reference" className="text-sm font-medium">
                                    Previous Absence Reference (Optional)
                                </Label>
                                <Select
                                    value={formData.previous_absence_reference || undefined}
                                    onValueChange={(value) => setFormData({ ...formData, previous_absence_reference: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select previous absence if applicable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {previousAbsences.map((absence) => (
                                            <SelectItem key={absence.id} value={absence.id}>
                                                {absence.date} - {absence.type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Comments */}
                            <div className="space-y-2">
                                <Label htmlFor="comments" className="text-sm font-medium">
                                    Comments (Optional)
                                </Label>
                                <Textarea
                                    id="comments"
                                    placeholder="Any additional comments about your return to work..."
                                    value={formData.comments}
                                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Return to Work Guidelines */}
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <h4 className="mb-2 font-medium text-yellow-800">Return to Work Guidelines:</h4>
                                <ul className="space-y-1 text-sm text-yellow-700">
                                    <li>• Submit this form at least 24 hours before your return</li>
                                    <li>• Medical clearance may be required for certain absences</li>
                                    <li>• Report to your supervisor upon return</li>
                                    <li>• Ensure all work equipment and access are functional</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button 
                                    type="submit" 
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                    disabled={!formData.return_date}
                                >
                                    Submit Return Notice
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
