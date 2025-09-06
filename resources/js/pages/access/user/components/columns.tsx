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
        // {
        //     id: 'index',
        //     header: 'No.',
        //     cell: ({ row }) => {
        //         return (
        //             <div className="text-sm font-medium text-gray-900">
        //                 {row.index + 1}
        //             </div>
        //         );
        //     },
        // },
        {
            accessorKey: 'fullname',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
            cell: ({ row }) => {
                const fullname = row.getValue('fullname') as string;
                const department = row.getValue('department') as string;
                const profileImage = row.original.profile_image;

                return (
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={fullname}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/Logo.png';
                                    }}
                                />
                            ) : (
                                <img
                                    src="/Logo.png"
                                    alt={fullname}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            )}
                        </div>
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

                // Define role colors based on role name
                const getRoleColor = (roleName: string) => {
                    const roleLower = roleName.toLowerCase();
                    if (roleLower.includes('super admin')) {
                        return 'bg-red-100 text-red-800 border-red-200';
                    } else if (roleLower.includes('admin')) {
                        return 'bg-purple-100 text-purple-800 border-purple-200';
                    } else if (roleLower.includes('manager')) {
                        return 'bg-blue-100 text-blue-800 border-blue-200';
                    } else if (roleLower.includes('hr')) {
                        return 'bg-pink-100 text-pink-800 border-pink-200';
                    } else if (roleLower.includes('supervisor')) {
                        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                    } else if (roleLower.includes('employee')) {
                        return 'bg-green-100 text-green-800 border-green-200';
                    } else {
                        // Default color for other roles
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                };

                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.slice(0, 3).map((role, index) => (
                            <span
                                key={index}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getRoleColor(role)}`}
                            >
                                {role}
                            </span>
                        ))}
                        {roles.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">
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
                                {can('View Admin Details') && (
                                    <DropdownMenuItem>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleView(user)}
                                            className="hover-lift w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </DropdownMenuItem>
                                )}
                                {can('Update Admin') && (
                                    <DropdownMenuItem>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(user)}
                                            className="hover-lift w-full border-green-300 text-green-600 hover:bg-green-50"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </DropdownMenuItem>
                                )}
                                {can('Delete Admin') && (
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

