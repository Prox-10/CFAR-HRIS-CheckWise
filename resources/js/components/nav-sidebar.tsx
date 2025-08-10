import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/user-permission';
import { type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function NavSidebar({ items = [] }: { items: NavItem[] }) {
   

    const page = usePage();
    const { can } = usePermission();
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    const toggleDropdown = (title: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    // Filter items based on permissions
    const filteredItems = items.filter((item) => {
        // If no permission is required, show the item
        if (!item.permission) return true;

        // Check if user has the required permission
        return can(item.permission);
    });

    // Filter sub-items based on permissions
    const filteredItemsWithSubItems = filteredItems
        .map((item) => {
            if (item.items && item.items.length > 0) {
                const filteredSubItems = item.items.filter((subItem) => {
                    if (!subItem.permission) return true;
                    return can(subItem.permission);
                });

                // Only show parent item if it has visible sub-items
                if (filteredSubItems.length > 0) {
                    return { ...item, items: filteredSubItems };
                }
                return null;
            }
            return item;
        })
        .filter(Boolean) as NavItem[];

    // For employee items, we don't need permission filtering
    const allItems = [...filteredItemsWithSubItems]
    return (
        <SidebarGroup className="px-2 py-8">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu className="font-semibold text-cfar-50">
                {allItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {/* Handle NavItem with items */}
                        {'items' in item && item.items && item.items.length > 0 ? (
                            <Collapsible open={openDropdowns[item.title]} onOpenChange={() => toggleDropdown(item.title)}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="mt-2 w-full justify-between" tooltip={{ children: item.title }}>
                                        <div className="flex items-center gap-2">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform duration-200 ${openDropdowns[item.title] ? 'rotate-180' : ''}`}
                                        />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild isActive={subItem.href === page.url} className="text-white">
                                                    <Link href={subItem.href} prefetch>
                                                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        ) : (
                            <SidebarMenuButton className="mt-2" asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                <Link className="font-semibold" href={item.href} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
