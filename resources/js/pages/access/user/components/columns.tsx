'use client';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { usePermission } from '@/hooks/user-permission';
import { SingleUser } from '@/types/users';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';

const columns = (
    setIsModalOpen: (open: boolean) => void,
    handleView: (user: SingleUser) => void,
    handleEdit: (user: SingleUser) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<SingleUser>[] => {
    const { can } = usePermission();

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
            id: 'index',
            header: 'No.',
            cell: ({ row }) => {
                return (
                    <div className="text-sm font-medium text-gray-900">
                        {row.index + 1}
                    </div>
                );
            },
        },
        {
            accessorKey: 'fullname',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
            cell: ({ row }) => {
                const fullname = row.getValue('fullname') as string;
                const department = row.getValue('department') as string;

                return (
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="text-sm font-medium text-gray-900">{fullname}</div>
                            <div className="text-xs text-gray-500">
                                {department || 'N/A'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => {
                const email = row.getValue('email') as string;
                return (
                    <div className="text-sm text-gray-900">
                        {email}
                    </div>
                );
            },
        },
        {
            accessorKey: 'department',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) => {
                const department = row.getValue('department') as string;
                return (
                    <div className="text-sm text-gray-900">
                        {department || 'N/A'}
                    </div>
                );
            },
        },

        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }) => {
                const roles = row.original.roles || [];

                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.slice(0, 3).map((role, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                            >
                                {role}
                            </span>
                        ))}
                        {roles.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                +{roles.length - 3} more
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Created Date',
            cell: ({ row }) => {
                const createdDate = row.getValue('created_at') as string;
                return (
                    <div className="text-sm text-gray-900">
                        {new Date(createdDate).toLocaleDateString()}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: () => <div>Action</div>,
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <>

                        {/* Dropdown for additional actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="border border-gray-200"
                                    aria-label="More actions"
                                >
                                    <CircleEllipsis className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {can('view-users') && (
                                    <DropdownMenuItem
                                        onClick={() => handleView(user)}
                                        className="flex items-center gap-2"
                                    >
                                        <Eye className="h-4 w-4 text-green-600" />
                                        View
                                    </DropdownMenuItem>
                                )}
                                {can('edit-users') && (
                                    <DropdownMenuItem
                                        onClick={() => handleEdit(user)}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {can('delete-users') && (
                                    <DropdownMenuItem asChild>
                                        <DeleteConfirmationDialog
                                            onConfirm={() =>
                                                handleDelete(user.id.toString(), () => {
                                                    toast.success('User deleted successfully!');
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

export { columns };
