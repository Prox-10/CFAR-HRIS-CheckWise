import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { Edit, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EmployeeDetailsModalProps {
    employee: any | null; // Accepts the new backend response shape
    isOpen: boolean;
    onClose: () => void;
    onEdit: (employee: any) => void;
    onDelete: (id: string, onSuccess: () => void) => void;
    onRegisterFingerprint?: (employee: any) => void;
}

const ViewEmployeeDetails = ({ isOpen, onClose, employee, onEdit, onDelete, onRegisterFingerprint }: EmployeeDetailsModalProps) => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [birth, setBirth] = useState<Date | undefined>(undefined);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // const renderStars = (rating: number) => {
    //     return Array.from({ length: 5 }, (_, index) => (
    //         <Star key={index} className={`h-5 w-5 ${index < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
    //     ));
    // };

    const [preview, setPreview] = useState<string>('');

    const { data, setData, errors, processing, reset, post } = useForm({
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
        email: '',
        service_tenure: '',
        date_of_birth: '',
        picture: '',
        _method: '',
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
                picture: employee.picture,
                _method: 'PUT',
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

    // Extract root-level fingerprint fields if present
    const fingerprint_image =
        employee && employee.fingerprint_image !== undefined ? employee.fingerprint_image : employee && employee.fingerprint_image;
    const finger_name = employee && employee.finger_name !== undefined ? employee.finger_name : employee && employee.finger_name;
    const fingerprint_captured_at =
        employee && employee.fingerprint_captured_at !== undefined ? employee.fingerprint_captured_at : employee && employee.fingerprint_captured_at;

    // Debug display
    // Remove after debugging
    const debug = true;
    //  const src = row.original.picture;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-2 border-main" aria-describedby="employee-description">
                <DialogHeader className="flex place-items-center sm:w-auto">
                    <DialogTitle className="flex items-center gap-2 text-main">
                        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-100">
                            {/* <ArrowLeft className="h-4 w-4 ml-auto" /> */}
                        </Button>
                        Employee Details
                    </DialogTitle>
                </DialogHeader>

                <div className="animate-fade-in space-y-6">
                    {/* Profile Section */}
                    <div className="text-center">
                        <div className="relative mx-auto mb-4 h-32 w-32">
                            <div className="flex-shrink-0">
                                {data.picture ? (
                                    <img
                                        src={data.picture}
                                        alt="Profile"
                                        className="animate-scale-in object-fit mx-auto h-32 w-32 rounded-full border-4 border-main"
                                    />
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                        <img
                                            src="Logo.png"
                                            className="animate-scale-in object-fit mx-auto h-32 w-32 rounded-full border-4 border-main"
                                        />
                                    </div>
                                )}
                            </div>
                            {/* <img
                                src={preview ? preview : 'Logo.png'}
                                alt={data.lastname}
                                className="animate-scale-in object-fit mx-auto h-32 w-32 rounded-full border-4 border-main"
                                onError={(e) => {
                                    e.currentTarget.src = `Logo.png`;
                                }}
                            /> */}
                        </div>
                        {/* Fingerprint image display */}

                        <h2 className="mb-2 text-2xl font-bold text-gray-900">{data.employee_name}</h2>
                        <Badge className="bg-green-100 px-4 py-2 text-lg text-gray-600">{data.employeeid}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{data.gender}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Birth Date</label>
                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{formatDate(data.date_of_birth)}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{data.email}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                                <Badge className="bg-green-100 px-4 py-2 text-green-800">{data.department}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Position</label>
                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{data.position}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{data.phone}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="border-t border-green-200 pt-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Employment Information</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Hired Date</label>
                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{formatDate(data.service_tenure)}</Badge>
                            </div>

                            <div className="flex items-center gap-2 flex-col">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Employee Rating</label>
                                
                                    {employee && employee.latest_rating ? (
                                        <>
                                            <div className="flex flex-col">
                                                <span></span>
                                                <Badge className="bg-green-100 px-4 py-2 text-gray-900">{employee.latest_rating}</Badge>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">No rating</span>
                                    )}
                                
                            </div>
                        </div>
                    </div>

                    {/* Fingerprint Images Section */}
                    <div className="mt-6">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Fingerprints</h3>
                        {employee && employee.fingerprints && employee.fingerprints.length > 0 ? (
                            <>
                                <div className="my-2 flex flex-col items-center">
                                    <p className="text-sm font-semibold text-green-600">Fingerprint Registered</p>
                                </div>
                                <div className="my-4 flex flex-wrap justify-center gap-6">
                                    {employee.fingerprints.map((fp: any, idx: number) => (
                                        <div key={fp.id || idx} className="flex flex-col items-center">
                                            <img
                                                src={fp.fingerprint_image ? `data:image/png;base64,${fp.fingerprint_image}` : 'Logo.png'}
                                                alt={`Fingerprint ${idx + 1}`}
                                                className="mx-auto h-32 w-32 rounded border border-green-400 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'Logo.png';
                                                }}
                                            />
                                            <p className="mt-1 text-center text-xs text-green-700">Fingerprint</p>
                                            {fp.finger_name && (
                                                <p className="text-xs text-gray-700">
                                                    Finger:{' '}
                                                    <span className="font-semibold">
                                                        {fp.finger_name.charAt(0).toUpperCase() + fp.finger_name.slice(1)}
                                                    </span>
                                                </p>
                                            )}
                                            {fp.fingerprint_captured_at && (
                                                <p className="text-xs text-gray-500">
                                                    Captured at: {new Date(fp.fingerprint_captured_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="my-4 flex flex-col items-center">
                                <p className="text-sm text-red-600">No fingerprint registered yet.</p>
                                <Button
                                    className="mt-2 bg-main text-black hover:bg-green-300"
                                    onClick={() => onRegisterFingerprint && onRegisterFingerprint(employee)}
                                >
                                    Register Fingerprint
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 border-t border-green-200 pt-6">
                        <Button onClick={() => onEdit(employee!)} className="bg-green-600 text-white hover:bg-main">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Employee
                        </Button>
                        <Button onClick={handleDelete} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Employee
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewEmployeeDetails;
