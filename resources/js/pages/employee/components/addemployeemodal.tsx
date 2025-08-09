// Filename: addemployeemodal.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDownIcon, Fingerprint, Save, Upload, User } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Department, Position } from '../types/employees';
import FingerprintCapture from './fingerprintcapture';
// import RegisterFingerprintModal from './registerfingerprintmodal';

type Employees = {
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
};

interface EmployeeDetails {
    isOpen: boolean;
    onClose: () => void;
    departments?: Department[];
    positions?: Position[];
}

const AddEmployeeModal = ({ isOpen, onClose, departments = [], positions = [] }: EmployeeDetails) => {
    const work_statuses = ['Regular', 'Add Crew'];
    const statuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
    const genderes = ['Male', 'Female'];

    const [openService, setOpenService] = useState(false);
    const [openBirth, setOpenBirth] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [employees, setEmployees] = useState<Employees[]>([]);
    const [savedEmployee, setSavedEmployee] = useState<any | null>(null); // Store created employee object
    const [fingerprintData, setFingerprintData] = useState<any | null>(null);
    const [fingerprintSaved, setFingerprintSaved] = useState(false);
    const [savingFingerprint, setSavingFingerprint] = useState(false);
    // Add WebSocket logic to listen for fingerprint_data and display it
    const [wsFingerprintData, setWsFingerprintData] = useState<any | null>(null);
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fingerprint_data') {
                    setWsFingerprintData(data);
                }
            } catch {}
        };
        return () => ws.close();
    }, []);

    interface FlashProps extends Record<string, any> {
        flash?: {
            success?: string;
            error?: string;
        };
    }

    const handleFingerprintCapture = (fingerprintData: string) => {
        ({ fingerprintImage: fingerprintData });
    };

    const handleProfileImageUpload = () => {
        // Create a file input element to upload the image
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // Allow only image files

        // When a file is selected, handle the file and update preview
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            console.log('Selected file:', file);
            if (file) {
                // Update the file state and show the image preview
                setSelectedFile(file);

                // Preview the image
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    console.log('Selected file:', result);

                    setPreview(result); // Set the preview for the image
                };
                reader.readAsDataURL(file);

                // Attach the image to the form data
                setData('picture', file); // Add image to the form data for submission
            }
        };

        input.click(); // Trigger the file input click to open file explorer
    };

    const { data, setData, errors, processing, reset, post } = useForm<Employees>({
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
    });

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setDate(undefined);
            setBirth(undefined); // <-- Reset Date of Birth
            setPreview('');
            setSelectedFile(null);
            setSavedEmployee(null);
            setFingerprintData(null);
            setFingerprintSaved(false);
        }, delay);
    };

    // Save employee info (step 1)
    const handleSaveInfo: FormEventHandler = async (event) => {
        event.preventDefault();
        if (savedEmployee) return; // Prevent double submit
        post(route('employee.store'), {
            preserveScroll: true,
            onSuccess: async (page) => {
                // Fetch the latest employee by employeeid from the new API endpoint using axios
                if (data.employeeid) {
                    try {
                        const res = await axios.get('/api/employee/by-employeeid', {
                            params: { employeeid: data.employeeid },
                        });
                        if (res.data && res.data.id) {
                            setSavedEmployee(res.data);
                        } else {
                            setSavedEmployee({ ...data });
                        }
                    } catch {
                        setSavedEmployee({ ...data });
                    }
                } else {
                    setSavedEmployee({ ...data });
                }
                toast.success('Employee info saved! Now register fingerprint.');
            },
            onError: (errors) => {
                toast.error('Failed to save employee info.');
            },
        });
    };

    // const handleSaveFingerprint = async () => {
    //     if (!savedEmployee || !fingerprintData) return;
    //     setSavingFingerprint(true);
    //     try {
    //         const response = await fetch('/api/fingerprint/store', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Accept: 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 employeeid: savedEmployee.employeeid, // <-- always use the string employeeid
    //                 fingerprint_template: fingerprintData.fingerprint_template,
    //                 fingerprint_image: fingerprintData.fingerprint_image,
    //                 fingerprint_captured_at: fingerprintData.fingerprint_captured_at,
    //                 finger_name: fingerprintData.finger_name || null,
    //             }),
    //         });
    //         const result = await response.json();
    //         if (response.ok && result.status === 'success') {
    //             setFingerprintSaved(true);
    //             toast.success('Fingerprint registered successfully!');
    //             closeModalWithDelay(1200);
    //         } else {
    //             toast.error(result.message || 'Failed to register fingerprint.');
    //         }
    //     } catch (err) {
    //         toast.error('Error saving fingerprint.');
    //     } finally {
    //         setSavingFingerprint(false);
    //     }
    // };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto border-2 border-cfar-500 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-800">Add New Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveInfo} className="space-y-2">
                    {message && (
                        <div className={`rounded p-2 ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    {/* Employee Information Registration */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label>Employee ID</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter employee id...."
                                value={data.employeeid}
                                onChange={(e) => setData('employeeid', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
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
                                className="border-green-300 focus:border-cfar-500"
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
                                className="border-green-300 focus:border-cfar-500"
                            />
                            {/* <InputError message={errors.middlename} /> */}
                        </div>
                        <div>
                            <Label>Lastname</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter lastname"
                                value={data.lastname}
                                onChange={(e) => setData('lastname', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
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
                                className="border-green-300 focus:border-cfar-500"
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
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.phone}
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.gender}
                                onValueChange={(value) => {
                                    console.log('Selected Gender:', value);
                                    setData('gender', value);
                                }}
                                aria-invalid={!!errors.gender}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
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
                                            className="w-48 w-full justify-between border-green-300 font-normal focus:border-cfar-500"
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
                                                    const localDateString = selectedBirth.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
                                                    console.log('Selected Local Date:', localDateString);
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
                                <Popover open={openService} onOpenChange={setOpenService}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-48 w-full justify-between border-green-300 font-normal focus:border-cfar-500"
                                            aria-invalid={!!errors.service_tenure}
                                            disabled={data.work_status === 'Add Crew'}
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
                                                setOpenService(false);
                                                if (selectedDate) {
                                                    const localDateString = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
                                                    console.log('Selected Local Date:', localDateString);
                                                    setData('service_tenure', localDateString);
                                                }
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {data.work_status === 'Add Crew' && (
                                    <p className="text-xs text-gray-500">Service tenure is not applicable for Add Crew employees</p>
                                )}
                                <InputError message={errors.service_tenure} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="work_status">Work Status</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.work_status}
                                onValueChange={(value) => {
                                    console.log('Selected Work Status:', value);
                                    setData('work_status', value);
                                    // Clear date of service tenure if switching from Regular to Add Crew
                                    if (value === 'Add Crew') {
                                        setDate(undefined);
                                        setData('service_tenure', '');
                                    }
                                }}
                                aria-invalid={!!errors.work_status}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
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
                                onValueChange={(value) => {
                                    console.log('Selected Departments:', value);
                                    setData('department', value);
                                }}
                                aria-invalid={!!errors.department}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
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
                            <Select
                                value={data.position}
                                onValueChange={(value) => {
                                    console.log('Selected Positions:', value);
                                    setData('position', value);
                                }}
                                aria-invalid={!!errors.position}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
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
                            <Select
                                value={data.status}
                                onValueChange={(value) => {
                                    console.log('Selected Status:', value);
                                    setData('status', value);
                                }}
                                aria-invalid={!!errors.status}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
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
                    <div className="ml-auto flex justify-end">
                        <Button type="submit" tabIndex={0} variant="main" disabled={processing || !!savedEmployee}>
                            {processing ? (
                                <>
                                    <div className="n mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Info
                                </>
                            )}
                        </Button>
                    </div>
                    {/* End of Employee Information Registration */}

                    <div className="md:col-span-2">
                        <div className="flex">
                            <Label className="mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-green-600" />
                                Profile Image
                                <span className="text-[15px] font-medium text-muted-foreground">(optional)</span>
                            </Label>
                        </div>

                        {/* <Input type="file" name="picture" onChange={handleFileChange} className="w-full" accept="image/*" /> */}
                    </div>
                    {/* Optional Employee Profile Upload */}
                    <div className="space-y-4">
                        <div
                            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-6 transition-colors hover:bg-green-100"
                            onClick={handleProfileImageUpload}
                        >
                            {preview ? (
                                <div className="mb-3 text-center">
                                    <p className="mb-1 text-sm">Image Preview:</p>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mx-auto mb-3 h-24 w-24 rounded-full border-2 border-green-300 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = `${'User'}&background=22c55e&color=fff`;
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
                                className="bg-main text-black transition duration-200 ease-in hover:bg-green-300"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Profile Image
                            </Button>
                        </div>
                        {/* End of Optional Employee Profile Upload */}

                        {/* Fingerprint Registration  */}
                        <div className="mt-4 md:col-span-2">
                            <Label className="mb-3 flex items-center gap-2">
                                <Fingerprint className="text-main h-4 w-4" />
                                Fingerprint Capture
                            </Label>
                            {savedEmployee ? (
                                <div className="mb-2 font-semibold text-green-700">
                                    Employee ID: {savedEmployee.employeeid} (#{savedEmployee.id})
                                </div>
                            ) : (
                                <div className="mb-2 text-gray-500">Save employee info first to enable fingerprint registration.</div>
                            )}
                            <FingerprintCapture
                                onFingerprintCaptured={setFingerprintData}
                                employeeId={savedEmployee?.employeeid}
                                onStartCapture={() => toast.info('Starting fingerprint capture...')}
                            />
                            {wsFingerprintData && (
                                <div className="mt-4 text-center">
                                    <div className="mb-2 font-medium text-green-800">Fingerprint Preview:</div>
                                    <img
                                        src={`data:image/png;base64,${wsFingerprintData.fingerprint_image}`}
                                        alt="Fingerprint Preview"
                                        className="mx-auto h-32 w-32 border object-contain"
                                    />
                                    <div className="mt-2 text-xs text-green-600">
                                        Captured at:{' '}
                                        {wsFingerprintData.fingerprint_captured_at
                                            ? new Date(wsFingerprintData.fingerprint_captured_at).toLocaleString()
                                            : ''}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => closeModalWithDelay(0)}
                                    className="bg-main font-semibold text-black transition duration-200 ease-in hover:bg-green-300"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                        {/* End of Fingerprint Registration  */}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => closeModalWithDelay(0)} disabled={processing || savingFingerprint}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEmployeeModal;
