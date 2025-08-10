'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar, CircleEllipsis, Clock, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';

type Absence = {
    id: string;
    full_name: string;
    employee_id_number: string;
    department: string;
    position: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    is_partial_day: boolean;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    approved_at?: string;
    days: number;
    employee_name?: string;
    picture?: string;
};

const columns = (
    setIsViewOpen: (open: boolean) => void,
    setViewAbsence: (absence: Absence | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedAbsence: (absence: Absence | null) => void,
    handleEdit: (absence: Absence) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<Absence>[] => [
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
            const src = row.original.picture;
            const name = row.original.full_name || row.original.employee_name;
            const empid = row.original.employee_id_number;

            return (
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {src ? (
                            <img
                                src={src}
                                alt="Profile"
                                className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                <img
                                    src="Logo.png"
                                    className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department & Position" />,
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
        accessorKey: 'absence_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Absence Type" />,
        cell: ({ row }) => {
            const absenceType: string = row.getValue('absence_type');

            const typeColors = {
                'Annual Leave': 'bg-purple-100 text-purple-800',
                'Personal Leave': 'bg-blue-100 text-blue-800',
                'Sick Leave': 'bg-yellow-100 text-yellow-800',
                'Emergency Leave': 'bg-red-100 text-red-800',
                'Maternity/Paternity': 'bg-pink-100 text-pink-800',
                Other: 'bg-gray-100 text-gray-800',
            };

            const colorClass = typeColors[absenceType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';

            return <Badge className={colorClass}>{absenceType}</Badge>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;
            const absenceType = row.getValue(columnId);
            return filterValue.includes(absenceType);
        },
    },
    {
        accessorKey: 'from_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date Range" />,
        cell: ({ row }) => {
            const fromDate = row.original.from_date;
            const toDate = row.original.to_date;
            const days = row.original.days;
            const isPartial = row.original.is_partial_day;

            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-medium">{fromDate}</span>
                        {fromDate !== toDate && (
                            <>
                                <span className="text-gray-400">to</span>
                                <span className="font-medium">{toDate}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                            {days} {days === 1 ? 'day' : 'days'}
                        </span>
                        {isPartial && (
                            <Badge variant="outline" className="text-xs">
                                Partial Day
                            </Badge>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status: string = row.getValue('status');

            const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                approved: 'bg-green-100 text-green-800',
                rejected: 'bg-red-100 text-red-800',
            };

            const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

            return <Badge className={colorClass}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;
            const status = row.getValue(columnId);
            return filterValue.includes(status);
        },
    },
    {
        accessorKey: 'submitted_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
        cell: ({ row }) => {
            const submittedAt = row.original.submitted_at;
            return <div className="text-sm text-gray-600">{format(new Date(submittedAt), 'MMM dd, yyyy')}</div>;
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const absence = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <CircleEllipsis className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSelectedAbsence(absence);
                                    setViewAbsence(absence);
                                    setIsViewOpen(true);
                                }}
                                className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Eye className="h-4 w-4" />
                                View Details
                            </Button>
                        </DropdownMenuItem>

                        {absence.status === 'pending' && (
                            <DropdownMenuItem>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedAbsence(absence);
                                        setEditModalOpen(true);
                                    }}
                                    className="hover-lift w-full border-green-300 text-green-600 hover:bg-green-50"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem asChild>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="hover-lift w-full border-red-300 text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Absence Request</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this absence request? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                handleDelete(absence.id, () => {
                                                    toast.success('Absence request deleted successfully!');
                                                })
                                            }
                                            className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export { columns, type Absence };
