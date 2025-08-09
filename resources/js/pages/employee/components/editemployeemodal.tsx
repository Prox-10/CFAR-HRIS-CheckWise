import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { ChevronDownIcon, Fingerprint, Upload, User } from 'lucide-react';
import React, { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Department, Employees, Position } from '../types/employees';
import FingerprintCapture from './fingerprintcapture';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employees | null;
    onUpdate: (employee: Employees) => void;
    departments?: Department[];
    positions?: Position[];
}

const EditEmployeeModal = ({ isOpen, onClose, employee, onUpdate, departments = [], positions = [] }: EditEmployeeModalProps) => {
    const work_statuses = ['Regular', 'Add Crew'];
    const statuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
    const genderes = ['Male', 'Female'];

    const [open, setOpen] = useState(false);
    const [openBirth, setOpenBirth] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, errors, processing, reset, post } = useForm<{
        employeeid: string;
        employee_name: string;
        firstname: string;
        middlename: string;
        lastname: string;
        gender: string;
        department: string;
        position: string;
        phone: string;
        work_status: string;
        status: string;
        email: string;
        service_tenure: string;
        date_of_birth: string;
        picture: File | null;
        _method: string;
    }>({
        employeeid: '',
        employee_name: '',
        firstname: '',
        middlename: '',
        lastname: '',
        gender: '',
        department: '',
        position: '',
        phone: '',
        work_status: '',
        status: '',
        service_tenure: '',
        date_of_birth: '',
        email: '',
        picture: null,
        _method: 'PUT',
    });

    useEffect(() => {
        if (employee) {
            setData({
                employeeid: employee.employeeid,
                employee_name: employee.employee_name,
                firstname: employee.firstname,
                middlename: employee.middlename || '',
                lastname: employee.lastname,
                gender: employee.gender,
                department: employee.department,
                position: employee.position,
                phone: employee.phone,
                work_status: employee.work_status,
                status: employee.status,
                service_tenure: employee.service_tenure,
                date_of_birth: employee.date_of_birth,
                email: employee.email,
                picture: null,
                _method: 'PUT',
            });

            if (employee.picture) {
                setPreview(employee.picture as unknown as string);
            }

            if (employee.service_tenure) {
                setDate(new Date(employee.service_tenure));
            }
            if (employee.date_of_birth) {
                setBirth(new Date(employee.date_of_birth));
            }
        }
    }, [employee]);

    const handleProfileImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                handleFileSelection(file);
            }
        };
        input.click();
    };

    // const handleProfileImageUpload = () => {
    //     const input = document.createElement('input');
    //     input.type = 'file';
    //     input.accept = 'image/*';
    //     input.onchange = (e) => {
    //         const file = (e.target as HTMLInputElement).files?.[0];
    //         if (file) {
    //             // Validate file type (image only)
    //             if (!file.type.match('image.*')) {
    //                 toast.error('Please select an image file');
    //                 return;
    //             }

    //             // Validate file size (max 2MB)
    //             if (file.size > 2 * 1024 * 1024) {
    //                 toast.error('Image size should be less than 2MB');
    //                 return;
    //             }

    //             // Handle file preview and update the form data
    //             const reader = new FileReader();
    //             reader.onload = (e) => {
    //                 const result = e.target?.result as string;
    //                 setPreview(result); // Set image preview
    //             };
    //             reader.readAsDataURL(file);

    //             // Update the selectedFile and form data
    //             setSelectedFile(file);
    //             setData({
    //                 ...data,
    //                 picture: file, // Update the picture field in form data
    //             });
    //         }
    //     };
    //     input.click();
    // };

    const handleFileSelection = (file: File) => {
        if (!file.type.match('image.*')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreview(result);
        };
        reader.readAsDataURL(file);

        setSelectedFile(file);
        setData('picture', file);
    };

    const handleFingerprintCapture = (fingerprintData: any) => {
        // TODO: integrate with form as needed
    };

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setDate(undefined);
            setBirth(undefined);
            setPreview('');
            setSelectedFile(null);
        }, delay);
    };

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         handleFileSelection(file);
    //     }
    // };

    const handleSubmit: FormEventHandler = (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        post(route('employee.update', employee?.id), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Employee updated successfully');
                if (employee) {
                    onUpdate({
                        ...employee,
                        employeeid: data.employeeid,
                        firstname: data.firstname,
                        middlename: data.middlename,
                        lastname: data.lastname,
                        gender: data.gender,
                        department: data.department,
                        position: data.position,
                        phone: data.phone,
                        work_status: data.work_status,
                        status: data.status,
                        service_tenure: data.service_tenure,
                        date_of_birth: data.date_of_birth,
                        email: data.email,
                    });
                }
                closeModalWithDelay(1200);
            },
            onError: (errors: any) => {
                toast.error('Failed to update employee');
                console.error('Update error:', errors);
            },
            onFinish: () => {
                setLoading(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-main max-h-[90vh] min-w-2xl overflow-y-auto border-2 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-main">Update Employee</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Employee details updating</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-2">
                    {message && (
                        <div className={`rounded p-2 ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label>Employee ID</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter employee id...."
                                value={data.employeeid}
                                onChange={(e) => setData('employeeid', e.target.value)}
                                className="border-main focus:border-green-500"
                                aria-invalid={!!errors.employeeid}
                            />
                            <InputError message={errors.employeeid} />
                        </div>
                        <div>
                            <Label>Firstname</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter firstname"
                                value={data.firstname}
                                onChange={(e) => setData('firstname', e.target.value)}
                                className="border-main focus:border-green-500"
                                aria-invalid={!!errors.firstname}
                            />
                            <InputError message={errors.firstname} />
                        </div>
                        <div>
                            <Label>Middlename</Label>
                            <span className="ms-2 text-[15px] font-medium text-muted">*</span>
                            <Input
                                type="text"
                                placeholder="Enter middlename"
                                value={data.middlename}
                                onChange={(e) => setData('middlename', e.target.value)}
                                className="border-main focus:border-green-500"
                            />
                        </div>
                        <div>
                            <Label>Lastname</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter lastname"
                                value={data.lastname}
                                onChange={(e) => setData('lastname', e.target.value)}
                                className="border-main focus:border-green-500"
                                aria-invalid={!!errors.lastname}
                            />
                            <InputError message={errors.lastname} />
                        </div>
                        <div>
                            <Label>Email Address</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="email"
                                placeholder="Enter email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="border-main focus:border-green-500"
                                aria-invalid={!!errors.email}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="Enter phone number..."
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="border-main focus:border-green-500"
                                aria-invalid={!!errors.phone}
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select value={data.gender} onValueChange={(value) => setData('gender', value)} aria-invalid={!!errors.gender}>
                                <SelectTrigger className="border-main focus:border-green-500">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genderes.map((gend) => (
                                        <SelectItem key={gend} value={gend}>
                                            {gend}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gender} />
                        </div>

                        <div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="dateBirth" className="px-1">
                                    Date of Birth
                                </Label>
                                <Popover open={openBirth} onOpenChange={setOpenBirth}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="border-main w-48 justify-between font-normal sm:w-auto"
                                            aria-invalid={!!errors.date_of_birth}
                                        >
                                            {birth ? birth.toLocaleDateString() : 'Select birth'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={birth}
                                            captionLayout="dropdown"
                                            onSelect={(selectedBirth) => {
                                                setBirth(selectedBirth);
                                                setOpenBirth(false);
                                                if (selectedBirth) {
                                                    const localDateString = selectedBirth.toLocaleDateString('en-CA');
                                                    setData('date_of_birth', localDateString);
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.date_of_birth} />
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="date" className="px-1">
                                    Date of Service Tenure
                                </Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="border-main w-48 justify-between font-normal sm:w-auto"
                                            aria-invalid={!!errors.service_tenure}
                                        >
                                            {date ? date.toLocaleDateString() : 'Select date'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate);
                                                setOpen(false);
                                                if (selectedDate) {
                                                    const localDateString = selectedDate.toLocaleDateString('en-CA');
                                                    setData('service_tenure', localDateString);
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.service_tenure} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="work_status">Work Status</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.work_status}
                                onValueChange={(value) => setData('work_status', value)}
                                aria-invalid={!!errors.work_status}
                            >
                                <SelectTrigger className="border-main focus:border-green-500">
                                    <SelectValue placeholder="Select Work Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {work_statuses.map((work_stat) => (
                                        <SelectItem key={work_stat} value={work_stat}>
                                            {work_stat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.work_status} />
                        </div>

                        <div>
                            <Label htmlFor="departments">Departments</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.department}
                                onValueChange={(value) => setData('department', value)}
                                aria-invalid={!!errors.department}
                            >
                                <SelectTrigger className="border-main focus:border-green-500">
                                    <SelectValue placeholder="Select Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.name}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.department} />
                        </div>
                        <div>
                            <Label htmlFor="positions">Positions</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select value={data.position} onValueChange={(value) => setData('position', value)} aria-invalid={!!errors.position}>
                                <SelectTrigger className="border-main focus:border-green-500">
                                    <SelectValue placeholder="Select Positions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((pos) => (
                                        <SelectItem key={pos.id} value={pos.name}>
                                            {pos.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.position} />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)} aria-invalid={!!errors.status}>
                                <SelectTrigger className="border-main focus:border-green-500">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((stat) => (
                                        <SelectItem key={stat} value={stat}>
                                            {stat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex">
                            <Label className="mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-green-600" />
                                Profile Image
                                <span className="text-[15px] font-medium text-muted-foreground">(optional)</span>
                            </Label>
                        </div>

                        {/* <Input type="file" name="image" onChange={handleFileChange} className="w-full" accept="image/*" ref={fileInputRef} />
                        <InputError message={errors.picture} /> */}
                    </div>
                    {/* Image preview section */}
                    <div className="space-y-4">
                        <div
                            className="border-main flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-green-50 p-6 transition-colors hover:bg-green-100"
                            onClick={handleProfileImageUpload}
                        >
                            {preview ? (
                                <div className="mb-3 text-center">
                                    <p className="mb-1 text-sm">Image Preview:</p>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="border-main mx-auto mb-3 h-24 w-24 rounded-full border-2 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=User&background=22c55e&color=fff`;
                                        }}
                                    />
                                    <p className="font-medium text-green-800">Profile Image Selected</p>
                                    <p className="text-sm text-green-600">Click to change</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <User className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-600">No Profile Image</p>
                                    <p className="text-sm text-gray-500">Click to select image</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                onClick={handleProfileImageUpload}
                                className="bg-main hover:bg-main text-black transition duration-200 ease-in"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Profile Image
                            </Button>
                        </div>

                        <div className="md:col-span-2">
                            <Label className="mb-3 flex items-center gap-2">
                                <Fingerprint className="text-main h-4 w-4" />
                                Fingerprint Capture
                            </Label>
                            <FingerprintCapture onFingerprintCaptured={handleFingerprintCapture} employeeId={data.employeeid} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => closeModalWithDelay(0)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || loading}
                            className="bg-main hover:bg-main font-semibold text-black transition duration-200 ease-in"
                        >
                            {processing || loading ? 'Updating...' : 'Update Employee'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditEmployeeModal;
