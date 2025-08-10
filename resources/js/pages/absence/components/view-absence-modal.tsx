import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, UserCheck, UserX } from 'lucide-react';
import { type Absence } from './columns';

interface ViewAbsenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    absence: Absence | null;
}

const ViewAbsenceModal = ({ isOpen, onClose, absence }: ViewAbsenceModalProps) => {
    if (!absence) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <UserCheck className="h-5 w-5 text-green-600" />;
            case 'rejected':
                return <UserX className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getTypeColor = (type: string) => {
        const typeColors = {
            'Annual Leave': 'bg-purple-100 text-purple-800',
            'Personal Leave': 'bg-blue-100 text-blue-800',
            'Sick Leave': 'bg-yellow-100 text-yellow-800',
            'Emergency Leave': 'bg-red-100 text-red-800',
            'Maternity/Paternity': 'bg-pink-100 text-pink-800',
            'Other': 'bg-gray-100 text-gray-800',
        };
        return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Absence Request Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Employee Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Employee Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {absence.picture ? (
                                        <img
                                            src={absence.picture}
                                            alt="Profile"
                                            className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
                                            <img
                                                src="/Logo.png"
                                                alt="Default"
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {absence.full_name || absence.employee_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">ID: {absence.employee_id_number}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            {absence.department} • {absence.position}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Absence Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                Absence Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Absence Type</label>
                                    <div className="mt-1">
                                        <Badge className={getTypeColor(absence.absence_type)}>
                                            {absence.absence_type}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        {getStatusIcon(absence.status)}
                                        <Badge className={getStatusColor(absence.status)}>
                                            {absence.status.charAt(0).toUpperCase() + absence.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">From Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{absence.from_date}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">To Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{absence.to_date}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Duration</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-900">
                                            {absence.days} {absence.days === 1 ? 'day' : 'days'}
                                        </span>
                                        {absence.is_partial_day && (
                                            <Badge variant="outline" className="text-xs">
                                                Partial Day
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Submitted</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {format(new Date(absence.submitted_at), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {absence.approved_at && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Processed</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {format(new Date(absence.approved_at), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reason */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Reason for Absence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 whitespace-pre-wrap">{absence.reason}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewAbsenceModal;
