'use client';
import DeleteConfirmationDialog from '@/components/delete-alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { usePermission } from '@/hooks/user-permission';
import { SinglePermission } from '@/types/role_permission';
import { ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DataTableColumnHeader } from './data-table-column-header';

const columns = (
    setIsModalOpen: (open: boolean) => void,
    handleView: (permission: SinglePermission) => void,
    handleEdit: (permission: SinglePermission) => void,
    handleDelete: (id: string, onSuccess: () => void) => void,
): ColumnDef<SinglePermission>[] => {
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
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Permission Name" />,
            cell: ({ row }) => {
                const permissionName = row.getValue('name') as string;

                return (
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="text-sm font-medium text-gray-900">{permissionName}</div>
                            {/* <div className="text-xs text-gray-500">ID: {row.original.id}</div> */}
                        </div>
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
                const permission = row.original;

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
                                {can('view-permissions') && (
                                    <DropdownMenuItem
                                        onClick={() => handleView(permission)}
                                        className="flex items-center gap-2"
                                    >
                                        <Eye className="h-4 w-4 text-green-600" />
                                        View
                                    </DropdownMenuItem>
                                )}
                                {can('edit-permissions') && (
                                    <DropdownMenuItem
                                        onClick={() => handleEdit(permission)}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {can('delete-permissions') && (
                                    <DropdownMenuItem asChild>
                                        <DeleteConfirmationDialog
                                            onConfirm={() =>
                                                handleDelete(permission.id.toString(), () => {
                                                    toast.success('Permission deleted successfully!');
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
