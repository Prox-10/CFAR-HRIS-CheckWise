import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    departments as departmentsData,
    gender as genderData,
    maritalStatus as maritalStatusData,
    positions as positionsData,
    workStatus as workStatusData,
} from '@/hooks/data';
import { Employees, initialEmployeeFormData } from '@/hooks/employees';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDownIcon, Fingerprint, Save, User } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import FingerprintCapture from './fingerprintcapture';

interface EmployeeDetails {
    isOpen: boolean;
    onClose: () => void;
}

const AddEmployeeModal = ({ isOpen, onClose }: EmployeeDetails) => {
    const [openService, setOpenService] = useState(false);
    const [openBirth, setOpenBirth] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [preview, setPreview] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [recommendationPreview, setRecommendationPreview] = useState<string>('');
    const [selectedRecommendationFile, setSelectedRecommendationFile] = useState<File | null>(null);
    const [recommendationFileName, setRecommendationFileName] = useState<string>('');

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

    const handleRecommendationLetterUpload = () => {
        // Create a file input element to upload the recommendation letter
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.txt,.rtf'; // Allow various document and image formats

        // When a file is selected, handle the file and update preview
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            console.log('Selected recommendation file:', file);
            if (file) {
                // Validate file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    toast.error('File size must be less than 10MB');
                    return;
                }

                // Validate file type
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/gif',
                    'image/bmp',
                    'image/tiff',
                    'text/plain',
                    'application/rtf',
                ];

                if (!allowedTypes.includes(file.type)) {
                    toast.error('Please select a valid file type (PDF, Word, Image, or Text)');
                    return;
                }

                // Update the file state
                setSelectedRecommendationFile(file);
                setRecommendationFileName(file.name);

                // Preview for images
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        setRecommendationPreview(result);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // For non-image files, show file info
                    setRecommendationPreview('');
                }

                // Attach the file to the form data
                setData('recommendation_letter', file);
                toast.success('Recommendation letter uploaded successfully!');
            }
        };

        input.click(); // Trigger the file input click to open file explorer
    };

    const { data, setData, errors, processing, reset, post } = useForm<Employees>(initialEmployeeFormData);

    const closeModalWithDelay = (delay: number = 1000) => {
        setTimeout(() => {
            onClose();
            reset();
            setDate(undefined);
            setBirth(undefined); // <-- Reset Date of Birth
            setPreview('');
            setSelectedFile(null);
            setRecommendationPreview('');
            setSelectedRecommendationFile(null);
            setRecommendationFileName('');
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
            forceFormData: true,
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
                    <div className="space-y-4">
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
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="">
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
                            <Label>
                                Middlename
                                <span className="text-[10px] font-medium text-muted-foreground">(optional)</span>
                            </Label>
                            <span className="ms-2 text-[15px] font-medium text-muted">*</span>
                            <Input
                                type="text"
                                placeholder="Enter middlename"
                                value={data.middlename}
                                onChange={(e) => setData('middlename', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
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
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.lastname}
                            />
                            <InputError message={errors.lastname} />
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
                                    {genderData.map((gender) => (
                                        <SelectItem key={gender} value={gender}>
                                            {gender}
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
                                    <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                </Label>

                                <Popover open={openBirth} onOpenChange={setOpenBirth}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full justify-between border-green-300 font-normal focus:border-cfar-500"
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
                                    Length of Service
                                    <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                                </Label>
                                <Popover open={openService} onOpenChange={setOpenService}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full justify-between border-green-300 font-normal focus:border-cfar-500"
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
                                }}
                                aria-invalid={!!errors.work_status}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
                                    <SelectValue placeholder="Select Work Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workStatusData.map((work_status) => (
                                        <SelectItem key={work_status} value={work_status}>
                                            {work_status}
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
                                    {departmentsData.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
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
                                    {positionsData.map((pos) => (
                                        <SelectItem key={pos} value={pos}>
                                            {pos}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.position} />
                        </div>
                        <div>
                            <Label htmlFor="marital_status">Marital Status</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Select
                                value={data.marital_status}
                                onValueChange={(value) => {
                                    console.log('Selected Marital Status:', value);
                                    setData('marital_status', value);
                                }}
                                aria-invalid={!!errors.marital_status}
                            >
                                <SelectTrigger className="border-green-300 focus:border-cfar-500">
                                    <SelectValue placeholder="Select Marital Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {maritalStatusData.map((maritalStatus) => (
                                        <SelectItem key={maritalStatus} value={maritalStatus}>
                                            {maritalStatus}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.marital_status} />
                        </div>
                        <div>
                            <Label>
                                Nationality
                                <span className="text-[10px] font-medium text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter your nationality..."
                                value={data.nationality}
                                onChange={(e) => setData('nationality', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                            />
                        </div>
                    </div>
                    <div className="mt-4"></div>
                    <div>
                        <h3 className="text-lg font-bold">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="">
                            <Label>Address</Label>
                            {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> */}
                            <Input
                                type="text"
                                placeholder="Enter your address..."
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.address}
                            />
                            <InputError message={errors.address} />
                        </div>
                        <div>
                            <Label>City</Label>
                            {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> */}
                            <Input
                                type="text"
                                placeholder="Enter your city..."
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.city}
                            />
                            <InputError message={errors.city} />
                        </div>
                        <div>
                            <Label htmlFor="phone">
                                Phone
                                <span className="text-[10px] font-medium text-muted-foreground">(optional)</span>
                            </Label>
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
                            <Label htmlFor="state">State</Label>
                            <Input
                                type="text"
                                placeholder="Enter your state..."
                                value={data.state}
                                onChange={(e) => setData('state', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.state}
                            />
                            <InputError message={errors.state} />
                        </div>
                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                type="text"
                                placeholder="Enter your country..."
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.country}
                            />
                            <InputError message={errors.country} />
                        </div>
                        <div>
                            <Label htmlFor="zip_code">Zip Code</Label>
                            <Input
                                type="text"
                                placeholder="Enter your zip code..."
                                value={data.zip_code}
                                onChange={(e) => setData('zip_code', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.zip_code}
                            />
                            <InputError message={errors.zip_code} />
                        </div>
                        <div>
                            <Label>Email Address</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="email"
                                placeholder="Enter email..."
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.email}
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <span className="ms-2 text-[15px] font-medium text-red-600">*</span>
                            <Input
                                type="text"
                                placeholder="Enter password..."
                                value={data.gmail_password}
                                onChange={(e) => setData('gmail_password', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.gmail_password}
                            />
                            <InputError message={errors.gmail_password} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Government IDs</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="">
                            <Label>Philhealth Number</Label>
                            {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> */}
                            <Input
                                type="text"
                                placeholder="Enter your philhealth..."
                                value={data.philhealth}
                                onChange={(e) => setData('philhealth', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.philhealth}
                            />
                            <InputError message={errors.philhealth} />
                        </div>
                        <div>
                            <Label>SSS Number</Label>
                            {/* <span className="ms-2 text-[15px] font-medium text-red-600">*</span> */}
                            <Input
                                type="text"
                                placeholder="Enter your sss..."
                                value={data.sss}
                                onChange={(e) => setData('sss', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.sss}
                            />
                            <InputError message={errors.sss} />
                        </div>
                        <div>
                            <Label htmlFor="pag-ibig">Pag-ibig Number</Label>
                            <Input
                                id="pag-ibig"
                                type="text"
                                placeholder="Enter pag-ibig number..."
                                value={data.pag_ibig}
                                onChange={(e) => setData('pag_ibig', e.target.value)}
                                className="border-green-300 focus:border-cfar-500"
                                aria-invalid={!!errors.pag_ibig}
                            />
                            <InputError message={errors.pag_ibig} />
                        </div>
                        <div>
                            <Label htmlFor="state">Tin Number</Label>
                            <Input
                                type="number"
                                placeholder="Enter your tin_number.."
                                value={data.tin}
                                onChange={(e) => setData('tin', e.target.value)}
                                className="border-green-300 focus:border-cfar-500 "
                                aria-invalid={!!errors.tin}
                            />
                            <InputError message={errors.tin} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Recommendation Letter</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="col-span-2">
                            <Label>Upload Recommendation Letter</Label>
                            <div
                                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-6 transition-colors hover:bg-green-100"
                                onClick={handleRecommendationLetterUpload}
                            >
                                {selectedRecommendationFile ? (
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-green-800">File Selected</p>
                                        <p className="text-sm text-green-600">{recommendationFileName}</p>
                                        <p className="text-xs text-gray-500">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-gray-600">No File Selected</p>
                                        <p className="text-sm text-gray-500">Click to select file (PDF, Word, Image, or Text)</p>
                                        <p className="text-xs text-gray-400">Max size: 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {recommendationPreview && (
                            <div className="col-span-2">
                                <div className="mb-2 font-medium text-green-800">File Preview:</div>
                                <div className="flex items-center justify-center rounded-md border bg-gray-50 p-4">
                                    {recommendationPreview.startsWith('data:image/') ? (
                                        <img
                                            src={recommendationPreview}
                                            alt="Recommendation Letter Preview"
                                            className="max-h-48 max-w-full rounded object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="font-medium text-gray-900">{recommendationFileName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(selectedRecommendationFile?.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 ml-auto flex justify-end">
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

                    {/* Optional Employee Profile Upload */}
                    <div className="space-y-4">
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
                                employeeFingerprints={[]}
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
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => closeModalWithDelay(0)}
                                        disabled={processing || savingFingerprint}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="button" variant="main" onClick={() => closeModalWithDelay(0)}>
                                        Done
                                    </Button>
                                </DialogFooter>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEmployeeModal;
