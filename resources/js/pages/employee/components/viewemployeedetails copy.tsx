
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Employees } from '../types/employees';
 
interface EmployeeDetailsModalProps {
  employee: Employees | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (employee: Employees) => void;
  onDelete: (id: string, onSuccess: () => void) => void;
}

const ViewEmployeeDetails = ({ isOpen, onClose, employee, onEdit, onDelete }: EmployeeDetailsModalProps) => {
   

    

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={`h-5 w-5 ${index < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    const [preview, setPreview] = useState<string>('');

    const [form, setForm] = useState({
        id: '',
        employeeid: '',
        employee_name: '',
        firstname: '',
        middlename: '',
        lastname: '',
        email: '',
        phone: '',
        department: '',
        work_status: '',
        position: '',
        status: '',
        service_tenure: '',
        date_of_birth: '',
        gender: '',
        picture: '',
    });

    useEffect(() => {
        if (employee) {
            console.log('Populating form with employee:', employee);
            populateForm(employee);
        }
    }, [employee]);

    const populateForm = (data: Employees) => {
        setForm({
            id: data.id,
            employeeid: data.employeeid,
            employee_name: data.employee_name,
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone,
            department: data.department,
            work_status: data.work_status,
            position: data.position,
            status: data.status,
            service_tenure: data.service_tenure,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            picture: data.picture,
        });
        setPreview(data.picture);
    };

      const handleDelete = () => {
          if (employee) {
             
              onDelete(employee.id, onClose);
          }
      };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-2 border-green-500" aria-describedby="employee-description">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-800">
                        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        Employee Details
                    </DialogTitle>
                </DialogHeader>

                <div className="animate-fade-in space-y-6">
                    {/* Profile Section */}
                    <div className="text-center">
                        <div className="relative mx-auto mb-4 h-32 w-32">
                            <img
                                src={preview ? preview : 'Logo.png'}
                                alt={form.lastname}
                                className="animate-scale-in mx-auto h-32 w-32 rounded-full border-4 border-green-500"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${form.lastname}&background=22c55e&color=fff&size=128`;
                                }}
                            />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">{form.employee_name}</h2>
                        <Badge variant='secondary' className="text-lg text-gray-600 px-4 py-2">{form.employeeid}</Badge>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                                <Badge variant="outline" className="border-green-300 text-green-700 px-4 py-2">
                                    {form.gender}
                                </Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Birth Date</label>
                                <Badge variant='outline' className="text-gray-900 py-2 px-4">{formatDate(form.date_of_birth)}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                                <Badge variant='outline' className="text-gray-900 py-2 px-4">{form.email}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                                <Badge className="bg-green-100 text-green-800 py-2 px-4">{form.department}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Position</label>
                                <Badge variant='outline' className="text-gray-900 py-2 px-4" >{form.position}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                                <Badge variant='outline' className="text-gray-900 py-2 px-4">{form.phone}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="border-t border-green-200 pt-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Employment Information</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Hired Date</label>
                                <Badge variant='outline'   className="text-gray-900 py-2 px-4">{formatDate(form.service_tenure)}</Badge>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Employee Rating</label>
                                <div className="flex items-center gap-2">
                                    {/* <div className="flex">{renderStars(employee.rating)}</div> */}
                                    {/* <span className="text-sm text-gray-600">({employee.rating}/5)</span> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 border-t border-green-200 pt-6">
                        <Button onClick={() => onEdit(employee!)} className="bg-green-600 text-white hover:bg-green-700">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Employee
                        </Button>
                        {/* <Button onClick={() => onDelete(employee.id)} variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Employee
                        </Button> */}
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
