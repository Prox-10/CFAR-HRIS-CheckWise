import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function NavSidebar({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    const toggleDropdown = (title: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    return (
        <SidebarGroup className="px-2 py-8">
            {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
            <SidebarMenu className="font-semibold text-cfar-50">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.items && item.items.length > 0 ? (
                            <Collapsible
                                open={openDropdowns[item.title]}
                                onOpenChange={() => toggleDropdown(item.title)}
                            >
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton 
                                        className="mt-2 w-full justify-between" 
                                        tooltip={{ children: item.title }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                                            openDropdowns[item.title] ? 'rotate-180' : ''
                                        }`} />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={subItem.href === page.url}
                                                >
                                                    <Link href={subItem.href} prefetch>
                                                        {subItem.icon && <subItem.icon />}
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        ) : (
                            <SidebarMenuButton 
                                className="mt-2" 
                                asChild 
                                isActive={item.href === page.url} 
                                tooltip={{ children: item.title }}
                            >
                                <Link className="p-3 py-5 font-semibold" href={item.href} prefetch>
                                    {item.icon && <item.icon />}
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
