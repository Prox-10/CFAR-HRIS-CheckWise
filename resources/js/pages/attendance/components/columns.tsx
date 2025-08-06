'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Edit, Eye } from 'lucide-react';
// import { Employees } from '../types/employees';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { DataTableColumnHeader } from './data-table-column-header';
import { } from './editemployeemodal';
import { usePermission } from '@/hooks/user-permission';

type Attendance = {
    id: string;
    timeIn: string;
    timeOut: string;
    breakTime: string;
    attendanceStatus: string;
    attendanceDate: string;
    employee_name: string;
    employeeid: string;
    picture: string;
    department: string;
    position: string;
    session: string;
};



const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewEmployee: (employee: Attendance | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedEmployee: (employee: Attendance | null) => void,
    handleEdit: (employee: Attendance) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<Attendance>[] => [
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
                const empid = row.original.employeeid;

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
                                        src="Logo.png"
                                        className="animate-scale-in h-12 w-12 rounded-full border-2 border-main object-cover dark:border-darksMain"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{name}</div>
                            <div className="text-xs text-gray-500">{empid}</div>
                        </div>
                    </div>
                );
            },
        },

        {
            accessorKey: 'department',
            header: 'Departments',
            cell: ({ row }) => {
                const department: string = row.getValue('department');
                const position = row.original.position;

                return (
                    <div>
                        <div className="text-sm font-medium text-gray-900">{department}</div>
                        <div className="text-xs text-gray-500">{position}</div>
                    </div>
                );
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;

                const department = row.getValue(columnId);

                return filterValue.includes(department);
            },
        },
        {
            accessorKey: 'Time-In',
            header: 'Time-In',
            cell: ({ row }) => {
                const timein = row.original.timeIn;
                return (
                    <div className="w-24">
                        <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium `}>
                            {formatTimeTo12Hour(timein)}
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
            accessorKey: 'Time-Out',
            header: 'Time-Out',
            cell: ({ row }) => {
                const timeout = row.original.timeOut;
                return (
                    <div className="w-24">
                        <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium `}>
                            {formatTimeTo12Hour(timeout)}
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
            accessorKey: 'session',
            header: 'Session',
            cell: ({ row }) => {
                const session = row.original.session;
                let colorClass = 'bg-gray-100 text-gray-800';
                if (session === 'morning') colorClass = 'bg-blue-100 text-blue-800';
                else if (session === 'afternoon') colorClass = 'bg-yellow-100 text-yellow-800';
                else if (session === 'evening') colorClass = 'bg-purple-100 text-purple-800';
                else if (session === 'night') colorClass = 'bg-gray-100 text-gray-800';
                return (
                    <div className="w-24">
                        <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${colorClass}`}>
                            {session ? session.charAt(0).toUpperCase() + session.slice(1) : ''}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const attendancestatus = row.original.attendanceStatus;

                let circleColor = '';
                if (attendancestatus === 'Late') {
                    circleColor = 'bg-yellow-400';
                } else if (attendancestatus === 'Login Successfully') {
                    circleColor = 'bg-blue-500';
                } else if (attendancestatus === 'Attendance Complete') {
                    circleColor = 'bg-green-500';
                } else {
                    circleColor = 'bg-gray-300';
                }
                return (
                    <div className="w-24 flex items-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${circleColor}`}></span>
                        <span className="text-xs font-medium">{attendancestatus}</span>
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
            accessorKey: 'action',
            header: () => <div>Action</div>,
            id: 'actions',
            cell: ({ row }) => {
                const employee = row.original;
                const { can } = usePermission();
                return (
                    <>
                        <DropdownMenu>
                            {/* <Toaster position="top-right" richColors /> */}
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <CircleEllipsis className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {can('View Attendance Details') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setViewEmployee(employee); // Set the employee data for the modal
                                            setIsViewOpen(true); // Open View modal
                                        }}
                                        className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Button>
                                </DropdownMenuItem>
                                )}
                                {can('Update Attendance') && (
                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedEmployee(employee);
                                            setEditModalOpen(true);
                                        }}
                                        className="hover-lift w-full border-green-300 text-green-600 hover:bg-green-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Update
                                    </Button>
                                </DropdownMenuItem>
                                )}
                                {can('Delete Attendance') && (  
                                <DropdownMenuItem asChild>
                                    <DeleteConfirmationDialog
                                        onConfirm={() =>
                                            handleDelete(employee.id, () => {
                                                // Optionally handle success here
                                                // toast.success('Employee deleted successfully!');
                                            })
                                        }
                                    />
                                </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                );
            },
        },
    ];

// Helper to format HH:mm:ss to 12-hour format with AM/PM
function formatTimeTo12Hour(timeStr: string) {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export { columns, type Attendance };

