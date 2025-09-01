import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CalendarDays, ChevronDown, Info } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export default function AbsenceRequestForm() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Request Forms', href: '/employee-view/absence' },
        { title: 'Submit Absence Notification', href: '/employee-view/absence/request' },
    ];

    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [reason, setReason] = React.useState<string>('');
    const { employee } = usePage().props as any;
    const [submitting, setSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (!date || !reason) {
            toast.error('Please fill in required fields.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.post('/employee-view/absence', {
                employee_id: employee?.id ?? null,
                full_name: employee?.employee_name ?? '',
                employee_id_number: employee?.employeeid ?? '',
                department: employee?.department ?? '',
                position: employee?.position ?? '',
                absence_type: 'Other',
                from_date: date.toISOString().slice(0, 10),
                to_date: date.toISOString().slice(0, 10),
                is_partial_day: false,
                reason,
            });
            toast.success('Absence request submitted successfully!');
            // Clear form after successful submission
            setDate(undefined);
            setReason('');
        } catch (e) {
            toast.error('Failed to submit absence request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setDate(undefined);
        setReason('');
    };

    // Get current date for calendar restrictions
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absence Request Form" />
            <Toaster position="top-right" richColors />

            <div className="w-full space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <CalendarDays className="h-5 w-5 text-emerald-600" />
                        <span>Submit Absence Notification</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Report your absence to HR</p>
                </div>

                <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-900">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Please submit absence notifications as soon as possible. For emergencies, contact your supervisor directly at
                        +63-XXX-XXXX-XXXX.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Absence Notification Form</CardTitle>
                        <CardDescription>Please provide details about your absence</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="font-medium">
                                Date of Absence <span className="text-destructive">*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-10 w-full justify-between">
                                        <span>{date ? date.toLocaleDateString() : 'mm/dd/yyyy'}</span>
                                        <ChevronDown className="h-4 w-4 opacity-60" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(date) => date < currentDate}
                                        className="rounded-md border"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-medium">
                                Reason for Absence <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide a detailed reason for your absence..."
                                className="min-h-32"
                            />
                        </div>

                        <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
                            <AlertTitle>Absence Policy:</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc space-y-1 pl-4">
                                    <li>Report absences before your scheduled shift when possible</li>
                                    <li>Medical documentation may be required for consecutive absences</li>
                                    <li>Frequent unexcused absences may affect your employment status</li>
                                    <li>Contact your supervisor for urgent situations</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <div />
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={clearForm}>
                                    Clear Form
                                </Button>
                                <Button variant="main" disabled={submitting} onClick={handleSubmit}>
                                    {submitting ? 'Submitting...' : 'Submit Absence Form'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <div className="font-semibold">HR Department</div>
                                <div className="text-sm text-muted-foreground">Phone: +63 XXX-XXX-XXXX</div>
                                <div className="text-sm text-muted-foreground">Email: hr@cfarbenpo.com</div>
                            </div>
                            <div>
                                <div className="font-semibold">Your Supervisor</div>
                                <div className="text-sm text-muted-foreground">Maria Santos</div>
                                <div className="text-sm text-muted-foreground">Phone: +63 XXX-XXX-XXXX</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
