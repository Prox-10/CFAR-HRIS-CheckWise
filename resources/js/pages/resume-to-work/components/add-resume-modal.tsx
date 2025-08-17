import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Employee {
    id: string;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
}

interface AddResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
}

const AddResumeModal = ({ isOpen, onClose, employees = [] }: AddResumeModalProps) => {
    const [returnDateOpen, setReturnDateOpen] = useState(false);
    const [returnDate, setReturnDate] = useState<Date | undefined>();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const { data, setData, errors, processing, reset, post } = useForm({
        employee_id: '',
        return_date: '',
        previous_absence_reference: '',
        comments: '',
    });

    const resetState = () => {
        reset();
        setReturnDate(undefined);
        setSelectedEmployee(null);
    };

    const closeNow = () => {
        onClose();
        resetState();
    };

    const handleEmployeeSelect = (employeeId: string) => {
        const emp = employees.find((e) => e.id === employeeId);
        if (emp) {
            setSelectedEmployee(emp);
            setData({
                ...data,
                employee_id: emp.id,
            });
        }
    };

    const handleReturnDate = (date?: Date) => {
        setReturnDate(date);
        setReturnDateOpen(false);
        if (date) {
            setData('return_date', format(date, 'yyyy-MM-dd'));
        } else {
            setData('return_date', '');
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.employee_id) {
            toast.error('Please select an employee');
            return;
        }

        if (!data.return_date) {
            toast.error('Please select a return date');
            return;
        } 

        post(route('resume-to-work.store'), {
            onSuccess: () => {
                toast.success('Resume to work request submitted successfully!');
                closeNow();
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Failed to submit resume to work request. Please check your input.');
            },
        });
    };

    // Get today's date for calendar restrictions
    const today = new Date();

    return (
        <Dialog open={isOpen} onOpenChange={closeNow}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Submit Resume to Work Request
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="employee_id">
                            Employee <span className="text-red-500">*</span>
                        </Label>
                        <Select value={data.employee_id} onValueChange={handleEmployeeSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{employee.employee_name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {employee.employeeid} • {employee.department} • {employee.position}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.employee_id} />
                    </div>

                    {/* Return Date */}
                    <div className="space-y-2">
                        <Label htmlFor="return_date">
                            Return Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {returnDate ? format(returnDate, 'PPP') : 'Select return date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={returnDate}
                                    onSelect={handleReturnDate}
                                    disabled={(date) => date < today}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <InputError message={errors.return_date} />
                    </div>

                    {/* Previous Absence Reference */}
                    <div className="space-y-2">
                        <Label htmlFor="previous_absence_reference">Previous Absence Reference</Label>
                        <Input
                            id="previous_absence_reference"
                            placeholder="e.g., Leave Request #123, Absence ID #456"
                            value={data.previous_absence_reference}
                            onChange={(e) => setData('previous_absence_reference', e.target.value)}
                        />
                        <InputError message={errors.previous_absence_reference} />
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                            id="comments"
                            placeholder="Additional comments or notes about the return to work..."
                            value={data.comments}
                            onChange={(e) => setData('comments', e.target.value)}
                            rows={3}
                        />
                        <InputError message={errors.comments} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeNow} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddResumeModal;
