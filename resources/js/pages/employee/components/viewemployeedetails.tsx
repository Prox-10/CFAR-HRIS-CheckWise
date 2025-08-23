import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Employee } from '@/hooks/employees';
import { useForm } from '@inertiajs/react';
import { Briefcase, Building, Calendar, Edit, Fingerprint, Mail, MapPin, Phone, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import FingerprintCapture from './fingerprintcapture';

interface EmployeeDetailsModalProps {
    employee: Employee | null; // Accepts the new backend response shape
    isOpen: boolean;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
    onDelete: (id: string, onSuccess: () => void) => void;
    onRegisterFingerprint?: (employee: Employee) => void;
}

const ViewEmployeeDetails = ({ isOpen, onClose, employee, onEdit, onDelete, onRegisterFingerprint }: EmployeeDetailsModalProps) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const [preview, setPreview] = useState<string>('');

    // Create view-specific initial data with string picture for display
    const initialEmployeeViewData: Employee = {
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
        marital_status: '',
        email: '',
        address: '',
        service_tenure: '',
        date_of_birth: '',
        picture: '', // String URL for display, not File for upload
        city: '',
        state: '',
        country: '',
        zip_code: '',
        nationality: '',
        philhealth: '',
        tin: '',
        sss: '',
        pag_ibig: '',
        gmail_password: '',
    };

    const { data, setData, errors, processing, reset, post } = useForm<Employee>(initialEmployeeViewData);

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
                marital_status: employee.marital_status || employee.status,
                service_tenure: employee.service_tenure,
                date_of_birth: employee.date_of_birth,
                email: employee.email,
                picture: employee.picture,
                nationality: employee.nationality,
                address: employee.address,
                city: employee.city,
                state: employee.state,
                country: employee.country,
                zip_code: employee.zip_code,
                philhealth: employee.philhealth,
                tin: employee.tin,
                sss: employee.sss,
                pag_ibig: employee.pag_ibig,
                gmail_password: employee.gmail_password,
            });

            if (employee.picture) {
                setPreview(employee.picture);
            }

            if (employee.service_tenure) {
                setDate(new Date(employee.service_tenure));
            }
            if (employee.date_of_birth) {
                setBirth(new Date(employee.date_of_birth));
            }
        }
    }, [employee]);

    const handleDelete = () => {
        if (employee) {
            onDelete(employee.id, onClose);
        }
    };

    // Function to check fingerprint status
    const getFingerprintStatus = () => {
        if (!employee) return { hasFingerprint: false, count: 0, status: 'No Employee' };

        if (employee.fingerprints && employee.fingerprints.length > 0) {
            return {
                hasFingerprint: true,
                count: employee.fingerprints.length,
                status: 'Fingerprint Registered',
            };
        }

        return {
            hasFingerprint: false,
            count: 0,
            status: 'No Fingerprint Registered',
        };
    };

    const fingerprintStatus = getFingerprintStatus();

    // Handle fingerprint capture from the component
    const handleFingerprintCapture = (fingerprintData: any) => {
        setFingerprintData(fingerprintData);
        // TODO: integrate with form as needed
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] w-full overflow-y-auto border-2 border-green-200 bg-white shadow-2xl sm:max-w-[900px]">
                    <DialogHeader className="flex items-center border-b border-green-200 pb-4">
                        <User className="mr-3 h-6 w-6 text-green-600" />
                        <DialogTitle className="text-2xl font-bold text-green-800">Employee Details</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 p-6">
                        {/* Employee Details Section - Top Card */}
                        <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start space-x-8">
                                {/* Profile Picture */}
                                <div className="flex-shrink-0">
                                    <div className="relative h-32 w-32">
                                        {data.picture ? (
                                            <img
                                                src={data.picture}
                                                alt="Profile"
                                                className="h-32 w-32 rounded-full border-4 border-green-300 object-cover shadow-lg"
                                            />
                                        ) : (
                                            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-green-300 bg-green-50">
                                                <User className="h-16 w-16 text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <h2 className="text-xl font-bold text-green-800">{data.employee_name}</h2>
                                        <Badge className="mt-1 bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                            ID: {data.employeeid}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Employee Details Grid - Fixed for long text */}
                                <div className="grid min-w-0 flex-1 grid-cols-2 gap-6">
                                    <div className="flex min-w-0 items-center space-x-3">
                                        <User className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Gender:</span>
                                        <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.gender}</Badge>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <Building className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Department:</span>
                                        <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.department}</Badge>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <Calendar className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Birth Date:</span>
                                        <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">
                                            {data.date_of_birth ? formatDate(data.date_of_birth) : 'N/A'}
                                        </Badge>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <Briefcase className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Position:</span>
                                        <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.position}</Badge>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <Mail className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Email:</span>
                                        <span className="max-w-full truncate text-sm text-gray-800" title={data.email}>
                                            {data.email}
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 items-center space-x-3">
                                        <Phone className="h-5 w-5 flex-shrink-0 text-green-600" />
                                        <span className="flex-shrink-0 text-sm font-medium text-gray-600">Phone:</span>
                                        <span className="max-w-full truncate text-sm text-gray-800">{data.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employment Information Section - Middle Card */}
                        <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-green-800">Employment Information</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex min-w-0 items-center space-x-3">
                                    <Calendar className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Hired Date:</span>
                                    <Badge className="truncate bg-green-100 px-3 py-1 text-sm text-green-800">
                                        {data.service_tenure ? formatDate(data.service_tenure) : 'N/A'}
                                    </Badge>
                                </div>

                                <div className="flex min-w-0 flex-col items-start space-y-2">
                                    <span className="text-sm font-medium text-gray-600">Employee Rating:</span>
                                    {employee && employee.latest_rating ? (
                                        <Badge className="truncate bg-green-100 px-3 py-1 text-sm text-green-800">{employee.latest_rating}</Badge>
                                    ) : (
                                        <span className="text-sm text-gray-500">No rating</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Section - Bottom Card */}
                        <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-green-800">Personal</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex min-w-0 items-center space-x-3">
                                    <User className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Marital Status:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.marital_status}</Badge>
                                </div>

                                <div className="flex min-w-0 items-center space-x-3">
                                    <User className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Nationality:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">
                                        {data.nationality || 'Not specified'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-green-800">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex min-w-0 items-center space-x-3">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Address:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800" title={data.address}>
                                        {data.address}
                                    </Badge>
                                </div>

                                <div className="flex min-w-0 items-center space-x-3">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">City:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.city}</Badge>
                                </div>

                                <div className="flex min-w-0 items-center space-x-3">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">State:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.state}</Badge>
                                </div>

                                <div className="flex min-w-0 items-center space-x-3">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Country:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.country}</Badge>
                                </div>

                                <div className="flex min-w-0 items-center space-x-3">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    <span className="flex-shrink-0 text-sm font-medium text-gray-600">Zip Code:</span>
                                    <Badge className="max-w-full truncate bg-green-100 px-3 py-1 text-sm text-green-800">{data.zip_code}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Fingerprints Section - Updated with registration functionality */}
                        <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-green-800">Fingerprints</h3>
                                {/* Fingerprint Status Badge - Updated with proper colors */}
                                <Badge
                                    className={`px-3 py-1 text-sm font-medium ${
                                        fingerprintStatus.hasFingerprint
                                            ? 'border border-green-300 bg-green-100 text-green-800'
                                            : 'border border-red-300 bg-red-100 text-red-800'
                                    }`}
                                >
                                    <Fingerprint className={`mr-2 h-4 w-4 ${fingerprintStatus.hasFingerprint ? 'text-green-600' : 'text-red-600'}`} />
                                    {fingerprintStatus.status}
                                </Badge>
                            </div>

                            {/* Fingerprint Capture Component - Added from editemployeemodal.tsx */}
                            <div className="mt-6 space-y-4">
                                <div className="md:col-span-2">
                                    <h4 className="text-md mb-3 flex items-center gap-2 font-semibold text-green-800">
                                        <Fingerprint className="text-main h-4 w-4" />
                                        Fingerprint Capture
                                    </h4>
                                    <FingerprintCapture
                                        onFingerprintCaptured={handleFingerprintCapture}
                                        employeeId={data.employeeid}
                                        employeeFingerprints={employee?.fingerprints || []}
                                    />

                                    {/* WebSocket Fingerprint Preview - Added from editemployeemodal.tsx */}
                                    {wsFingerprintData && (
                                        <div className="mt-4 text-center">
                                            <div className="mb-2 font-medium text-green-800">Fingerprint Preview:</div>
                                            <img
                                                src={`data:image/png;base64,${wsFingerprintData.fingerprint_image}`}
                                                alt="Fingerprint Preview"
                                                className="mx-auto h-32 w-32 border object-contain"
                                            />
                                            <div className="text-xs text-green-600">
                                                Captured at:{' '}
                                                {wsFingerprintData.fingerprint_captured_at
                                                    ? new Date(wsFingerprintData.fingerprint_captured_at).toLocaleString()
                                                    : ''}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 border-t border-green-200 pt-6">
                            <Button onClick={() => onEdit(employee!)} className="bg-green-600 px-6 py-2 text-white hover:bg-green-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Employee
                            </Button>
                            <Button onClick={handleDelete} variant="destructive" className="px-6 py-2">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Employee
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewEmployeeDetails;
