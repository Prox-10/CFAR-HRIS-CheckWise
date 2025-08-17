'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Clock, Edit, Eye, XCircle, CreditCard } from 'lucide-react';
// import { Employees } from '../types/employees';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { DataTableColumnHeader } from './data-table-column-header';
import {} from './editemployeemodal';

type Leave = {
    id: string;
    leave_start_date: string;
    employee_name: string;
    leave_type: string;
    leave_end_date: string;
    leave_days: string;
    status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string;
    leave_comments: string;
    picture: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
};

const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewLeave: (leave: Leave | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedLeave: (leave: Leave | null) => void,
    handleEdit: (leave: Leave) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<Leave>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
    },
    {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => {
            // const src = row.getValue('picture') as string;
            const src = row.original.picture;
            const name = row.original.employee_name;

            return (
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {src ? (
                            <img
                                src={src}
                                alt="Profile"
                                className="animate-scale-in h-12 w-12 rounded-full border-2 border-main object-cover dark:border-darksMain"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                <img
                                    src="\Logo.png"
                                    className="animate-scale-in h-12 w-12 rounded-full border-2 border-main object-cover dark:border-darksMain"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'credits',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Credits" />,
        cell: ({ row }) => {
            const remaining = row.original.remaining_credits || 0;
            const used = row.original.used_credits || 0;
            const total = row.original.total_credits || 12;

            const getCreditStatus = () => {
                if (remaining === 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
                if (remaining <= 3) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
                if (remaining <= 6) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
                return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
            };

            const status = getCreditStatus();

            return (
                <div className="flex items-center gap-2">
                    <CreditCard className={`h-4 w-4 ${status.color}`} />
                    <div className="text-sm">
                        <div className={`font-medium ${status.color}`}>{remaining}/{total}</div>
                        <div className="text-xs text-muted-foreground">{used} used</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'Leave Type',
        header: 'Leave Type',
        cell: ({ row }) => {
            // const leave: string = row.getValue('leave_type');
            // const position = row.original.position;
            const leave = row.original.leave_type;

            return (
                <Badge variant="outline" className="bg-green-100 px-5 py-2 text-sm font-semibold text-green-600">
                    {leave}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveType = row.getValue(columnId);

            return filterValue.includes(leaveType);
        },
    },
    {
        accessorKey: 'leave Days',
        header: 'Period',
        cell: ({ row }) => {
            const leave_days = row.original.leave_days;

            return (
                <Badge variant="outline" className="bg-green-100 px-5 py-2 text-sm font-semibold text-green-600">
                    {leave_days}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveDays = row.getValue(columnId);

            return filterValue.includes(leaveDays);
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const leave_status: string = row.getValue('status');
            // const leave_status = row.original.leave_status;

            let statusLeaveColors = '';
            let StatusIcon = null;
            if (leave_status === 'Pending') {
                statusLeaveColors = 'bg-yellow-100 text-yellow-800 font-semibold text-lg p-3';
                StatusIcon = Clock;
            } else if (leave_status === 'Approved') {
                statusLeaveColors = 'bg-green-100 text-green-800';
                StatusIcon = CheckCircle;
            } else {
                statusLeaveColors = 'bg-red-100 text-red-800';
                StatusIcon = XCircle;
            }
            return (
                <div className="w-24">
                    <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusLeaveColors}`}>
                        {StatusIcon && <StatusIcon className="mr-1 h-4 w-4" />}
                        {leave_status}
                    </span>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveStatus = row.getValue(columnId);

            return filterValue.includes(leaveStatus);
        },
    },
    {
        accessorKey: 'Submitted',
        header: 'Submitted',
        cell: ({ row }) => {
            // const leave: string = row.getValue('leave_type');
            // const position = row.original.position;
            const leave = row.original.leave_date_reported;

            return (
                <Badge variant="outline" className="bg-green-100 px-5 py-2 text-sm font-semibold text-green-600">
                    {leave}
                </Badge>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const leaveType = row.getValue(columnId);

            return filterValue.includes(leaveType);
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const leave = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 p-0 px-3 hover:bg-green-200"
                        onClick={() => {
                            setSelectedLeave(leave);
                            setViewLeave(leave); // Set the employee data for the modal
                            setIsViewOpen(true); // Open View modal
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={route('leave.edit', leave.id)}>
                        <Button variant="outline" size="icon" className="h-8 w-8 p-0 px-3 hover:bg-green-200">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            );
        },
    },
];

export { columns };
