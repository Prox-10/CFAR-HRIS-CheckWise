'use client';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Edit, Eye, Fingerprint, Key, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Employees } from '../types/employees';
import { DataTableColumnHeader } from './data-table-column-header';

// Permission checks are passed in from the parent to avoid calling hooks here

const columns = (
    can: (permission: string) => boolean,
    setIsViewOpen: (open: boolean) => void,
    setViewEmployee: (employee: Employees | null) => void,
    setIsModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedEmployee: (employee: Employees | null) => void,
    handleEdit: (employee: Employees) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<Employees>[] => {
    return [
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
                                    className="animate-scale-in dark:border-darksMain h-12 w-12 rounded-full border-2 border-cfar-400 object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                    <img
                                        src="Logo.png"
                                        className="animate-scale-in dark:border-darksMain h-12 w-12 rounded-full border-2 border-cfar-400 object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{name}</div>
                            <div className="flex flex-1 space-x-1">
                                <div className="text-xs text-gray-500">{empid}</div>
                                <Fingerprint
                                    className={`size-4 ${row.original.fingerprints && row.original.fingerprints.length > 0 ? 'text-cfar-400' : 'text-red-500'}`}
                                />
                            </div>
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
            accessorKey: 'pin',
            header: ({ column }) => <DataTableColumnHeader column={column} title="PIN" />,
            cell: ({ row }) => {
                const pin = row.original.pin;

                return (
                    <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-gray-500" />
                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{pin ? pin : 'Not set'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'work_status',
            header: 'Work Status',
            cell: ({ row }) => {
                const work_status: string = row.getValue('work_status');

                const workStatusColor =
                    work_status === 'Regular'
                        ? 'bg-green-100 text-green-800'
                        : work_status === 'Add Crew'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800';

                return <span className={`rounded px-2 py-1 text-xs font-medium ${workStatusColor}`}>{work_status}</span>;
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;

                const workStatus = row.getValue(columnId);

                return filterValue.includes(workStatus);
            },
        },
        {
            accessorKey: 'action',
            header: () => <div>Action</div>,
            id: 'actions',
            cell: ({ row }) => {
                const employee = row.original;

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
                                {can('View Employee Details') && (
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

                                {can('Update Employee') && (
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

                                <DropdownMenuItem>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('/employee_reset_pin', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                    },
                                                    body: JSON.stringify({
                                                        employee_id: employee.employeeid,
                                                    }),
                                                });

                                                const result = await response.json();
                                                
                                                if (result.success) {
                                                    toast.success(`PIN reset successfully! New PIN: ${result.pin}`);
                                                    // Refresh the page to update the PIN display
                                                    window.location.reload();
                                                } else {
                                                    toast.error(result.message || 'Failed to reset PIN');
                                                }
                                            } catch (error) {
                                                toast.error('An error occurred while resetting PIN');
                                            }
                                        }}
                                        className="hover-lift w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Reset PIN
                                    </Button>
                                </DropdownMenuItem>

                                {can('Delete Employee') && (
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
};

export { columns, type Employees };
