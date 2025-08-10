import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { Camera, User } from 'lucide-react';
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
    email?: string;
    phone?: string;
    address?: string;
}

interface ProfileFormData {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    department: string;
    address: string;
}

interface ProfilePageProps {
    employee: Employee;
}

const departments = [
    'Packing',
    'Production',
    'Quality Control',
    'Maintenance',
    'Warehouse',
    'Administration',
    'Human Resources',
    'Finance',
    'IT',
    'Sales',
    'Marketing',
];

export default function ProfilePage({ employee }: ProfilePageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        firstname: employee.firstname || '',
        lastname: employee.lastname || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        address: employee.address || '',
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

    const handleSaveChanges = () => {
        // TODO: Implement profile update functionality
        console.log('Saving profile changes:', formData);
        alert('Profile updated successfully!');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            firstname: employee.firstname || '',
            lastname: employee.lastname || '',
            email: employee.email || '',
            phone: employee.phone || '',
            department: employee.department || '',
            address: employee.address || '',
        });
        setIsEditing(false);
    };

    const handleChangePhoto = () => {
        // TODO: Implement photo upload functionality
        console.log('Changing profile photo...');
        alert('Photo upload functionality coming soon!');
    };

    return (
        <>
            <Head title="Profile Settings" />
            <EmployeeLayout employee={employee} currentPage="profile settings" onLogout={handleLogout}>
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600">Manage your personal information and account details</p>
                    </div>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Profile Picture Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Picture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {employee.picture ? (
                                    <img
                                        src={employee.picture}
                                        alt={employee.employee_name}
                                        className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-200">
                                        <span className="text-2xl font-bold text-gray-500">
                                            {employee.firstname?.charAt(0)}
                                            {employee.lastname?.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <Button onClick={handleChangePhoto} variant="outline" className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        Change Photo
                                    </Button>
                                    <p className="mt-2 text-xs text-gray-500">Max file size: 5MB. Formats: JPG, PNG</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your basic personal details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname" className="text-sm font-medium">
                                            First Name
                                        </Label>
                                        <Input
                                            id="firstname"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname" className="text-sm font-medium">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="lastname"
                                            value={formData.lastname}
                                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employeeid" className="text-sm font-medium">
                                        Employee ID
                                    </Label>
                                    <Input id="employeeid" value={employee.employeeid} disabled className="bg-gray-50" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-sm font-medium">
                                        Department
                                    </Label>
                                    <Select
                                        value={formData.department || undefined}
                                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                                        disabled={!isEditing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm font-medium">
                                        Address
                                    </Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Action Buttons */}
                                {isEditing && (
                                    <div className="flex gap-4 pt-4">
                                        <Button onClick={handleSaveChanges} className="flex-1 bg-green-600 hover:bg-green-700">
                                            Save Changes
                                        </Button>
                                        <Button onClick={handleCancel} variant="outline" className="flex-1">
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </EmployeeLayout>
        </>
    );
}
