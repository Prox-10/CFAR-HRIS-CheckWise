import { Head, router } from '@inertiajs/react';
import { EmployeeLayout } from './components/layout/employee-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Download } from 'lucide-react';
import { useState } from 'react';

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface Record {
    id: string;
    type: string;
    dates: string;
    days: string;
    status: 'approved' | 'pending' | 'rejected';
    submitted: string;
    comments: string;
}

interface RecordsPageProps {
    employee: Employee;
    records?: Record[];
    summary?: {
        leaveDaysRemaining: number;
        totalRequests: number;
        approved: number;
        pending: number;
    };
}

const mockRecords: Record[] = [
    {
        id: 'REQ001',
        type: 'Leave (Vacation)',
        dates: '2024-01-15 to 2024-01-17',
        days: '3 days',
        status: 'approved',
        submitted: '2024-01-10',
        comments: 'Family vacation'
    },
    {
        id: 'ABS001',
        type: 'Absence (Sick)',
        dates: '2024-01-08',
        days: '1 day',
        status: 'approved',
        submitted: '2024-01-08',
        comments: 'Flu symptoms'
    },
    {
        id: 'REQ002',
        type: 'Leave (Emergency)',
        dates: '2024-01-20 to 2024-01-22',
        days: '3 days',
        status: 'pending',
        submitted: '2024-01-18',
        comments: 'Family emergency'
    },
    {
        id: 'RTW001',
        type: 'Return to Work (From Sick Leave)',
        dates: '2024-01-09',
        days: '-',
        status: 'approved',
        submitted: '2024-01-08',
        comments: 'Feeling better, ready to return'
    }
];

export default function RecordsPage({ employee, records = mockRecords, summary }: RecordsPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

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

    const handleExportPDF = () => {
        // TODO: Implement PDF export functionality
        console.log('Exporting records to PDF...');
        alert('PDF export functionality coming soon!');
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             record.comments.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || record.type.toLowerCase().includes(typeFilter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const variants = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={`text-xs ${variants[status as keyof typeof variants]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const summaryData = summary || {
        leaveDaysRemaining: 12,
        totalRequests: 5,
        approved: 3,
        pending: 1
    };

    return (
        <>
            <Head title="Leave/Absence Records" />
            <EmployeeLayout 
                employee={employee} 
                currentPage="leave/absence records"
                onLogout={handleLogout}
            >
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave & Absence Records</h1>
                        <p className="text-gray-600">View and manage your leave and absence history</p>
                    </div>
                </div>

                {/* Summary Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{summaryData.leaveDaysRemaining}</div>
                            <div className="text-sm text-gray-600">Leave Days Remaining</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{summaryData.totalRequests}</div>
                            <div className="text-sm text-gray-600">Total Requests</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{summaryData.approved}</div>
                            <div className="text-sm text-gray-600">Approved</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{summaryData.pending}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Records Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filter Records</CardTitle>
                        <CardDescription>Search and filter your leave and absence records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by ID, type, or comments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="leave">Leave</SelectItem>
                                    <SelectItem value="absence">Absence</SelectItem>
                                    <SelectItem value="return">Return to Work</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Records Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Records ({filteredRecords.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Comments</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.id}</TableCell>
                                        <TableCell>{record.type}</TableCell>
                                        <TableCell>{record.dates}</TableCell>
                                        <TableCell>{record.days}</TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell>{record.submitted}</TableCell>
                                        <TableCell className="max-w-xs truncate">{record.comments}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </EmployeeLayout>
        </>
    );
} 