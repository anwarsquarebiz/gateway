import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

function isRouteActive(pageUrl: string, itemUrl: string): boolean {
    return pageUrl === itemUrl || pageUrl.startsWith(itemUrl + '/');
}

function anyChildActive(pageUrl: string, items: NavItem[]): boolean {
    return items.some((sub) => isRouteActive(pageUrl, sub.url));
}

function NavCollapsible({ item }: { item: NavItem }) {
    const page = usePage();
    const subItems = item.items ?? [];
    const pathMatches = anyChildActive(page.url, subItems);
    const [open, setOpen] = React.useState(pathMatches);

    // Expand/collapse when the route changes; do not tie to `pathMatches` alone or manual collapse reopens on the same URL.
    React.useEffect(() => {
        setOpen(anyChildActive(page.url, item.items ?? []));
    }, [page.url, item.items]);

    return (
        <SidebarMenuItem>
            <Collapsible className="group/collapsible w-full" open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={pathMatches}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isRouteActive(page.url, subItem.url)}>
                                    <Link href={subItem.url} prefetch>
                                        {subItem.icon && <subItem.icon />}
                                        <span>{subItem.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.items?.length ? (
                        <NavCollapsible key={item.title} item={item} />
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.url === page.url}>
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
