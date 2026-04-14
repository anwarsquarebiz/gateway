import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    BookOpen,
    Building2,
    CircleDollarSign,
    Coins,
    CreditCard,
    LayoutGrid,
    Smartphone,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';
import { cn } from '@/lib/utils';

/** Vivid sidebar shell: gradient panel + clear hover / active states for nav links */
const sidebarVividClassName = cn(
    // Inner sidebar surface (gradient + soft border)
    '[&_[data-sidebar=sidebar]]:border [&_[data-sidebar=sidebar]]:border-indigo-200/60 [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-indigo-50/95 [&_[data-sidebar=sidebar]]:via-white [&_[data-sidebar=sidebar]]:to-violet-50/90',
    'dark:[&_[data-sidebar=sidebar]]:border-indigo-400/25 dark:[&_[data-sidebar=sidebar]]:from-indigo-950/50 dark:[&_[data-sidebar=sidebar]]:via-zinc-950/80 dark:[&_[data-sidebar=sidebar]]:to-violet-950/40',
    // Section labels
    '[&_[data-sidebar=group-label]]:font-semibold [&_[data-sidebar=group-label]]:text-indigo-700/90',
    'dark:[&_[data-sidebar=group-label]]:text-indigo-200/90',
    // Primary menu buttons — hover
    '[&_[data-sidebar=menu-button]:hover]:shadow-sm [&_[data-sidebar=menu-button]:hover]:!bg-indigo-100/90 [&_[data-sidebar=menu-button]:hover]:!text-indigo-950',
    'dark:[&_[data-sidebar=menu-button]:hover]:!bg-indigo-500/25 dark:[&_[data-sidebar=menu-button]:hover]:!text-indigo-50',
    // Primary menu buttons — active (current route)
    '[&_[data-sidebar=menu-button][data-active=true]]:shadow-md [&_[data-sidebar=menu-button][data-active=true]]:!bg-gradient-to-r [&_[data-sidebar=menu-button][data-active=true]]:!from-violet-600 [&_[data-sidebar=menu-button][data-active=true]]:!to-indigo-600 [&_[data-sidebar=menu-button][data-active=true]]:!text-white',
    '[&_[data-sidebar=menu-button][data-active=true]_svg]:!text-white [&_[data-sidebar=menu-button][data-active=true]_span]:!text-white',
    'dark:[&_[data-sidebar=menu-button][data-active=true]]:!from-violet-500 dark:[&_[data-sidebar=menu-button][data-active=true]]:!to-indigo-500',
    // Submenu rail + items
    '[&_[data-sidebar=menu-sub]]:!border-indigo-200/70 dark:[&_[data-sidebar=menu-sub]]:!border-indigo-500/30',
    '[&_[data-sidebar=menu-sub-button]:hover]:!bg-indigo-100/75 [&_[data-sidebar=menu-sub-button]:hover]:!text-indigo-950',
    'dark:[&_[data-sidebar=menu-sub-button]:hover]:!bg-indigo-500/20 dark:[&_[data-sidebar=menu-sub-button]:hover]:!text-indigo-50',
    '[&_[data-sidebar=menu-sub-button][data-active=true]]:!border-l-2 [&_[data-sidebar=menu-sub-button][data-active=true]]:!border-indigo-500 [&_[data-sidebar=menu-sub-button][data-active=true]]:!bg-indigo-500/12 [&_[data-sidebar=menu-sub-button][data-active=true]]:!font-semibold [&_[data-sidebar=menu-sub-button][data-active=true]]:!text-indigo-900',
    'dark:[&_[data-sidebar=menu-sub-button][data-active=true]]:!bg-indigo-400/15 dark:[&_[data-sidebar=menu-sub-button][data-active=true]]:!text-indigo-50',
);

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Merchants Center',
        url: '/merchants-center',
        icon: Building2,
        items: [
            {
                title: 'Collection Orders',
                url: '/collection-orders',
                // icon: CreditCard,
            },
            {
                title: 'Payment Orders',
                url: '/payment-orders',
                // icon: Banknote,
            },
            {
                title: 'Fund Details',
                url: '/fund-details',
                // icon: Wallet,
            },
        ],
    },
    {
        title: 'Brokers Center',
        url: '/brokers-center',
        icon: Users,
        items: [
            {
                title: 'Merchants',
                url: '/merchants',
            },
            {
                title: 'Commission',
                url: '/commission',
            },
            {
                title: 'Payouts',
                url: '/payouts',
            },            
        ],
    },
    {
        title: 'Withdraw',
        url: '/withdraw',
        icon: CircleDollarSign
    },
    {
        title: 'Docs',
        url: '/docs',
        icon: BookOpen,
        items: [
            {
                title: 'Collection orders (Payin)',
                url: '/payin',
            },
            {
                title: 'Payment orders (Payout)',
                url: '/payout',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Bank Accounts',
        url: '/withdraw#bank-accounts',
        icon: Banknote,
    },
    {
        title: 'UPI IDs',
        url: '/withdraw#user-upi-ids',
        icon: Smartphone,
    },
    {
        title: 'USDT Wallet',
        url: '/withdraw#usdt-wallets',
        icon: Wallet,
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const role = page.props.auth.user?.role;
    const isAdmin = role === 'admin';
    const isBroker = role === 'broker';
    const isMerchant = role === 'merchant';

    const visibleMainNavItems = mainNavItems.filter((item) => {
        if (item.title === 'Brokers Center') {
            return isAdmin || isBroker;
        }

        if (item.title === 'Merchants Center') {
            return isAdmin || isMerchant;
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset" className={sidebarVividClassName}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>                
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleMainNavItems} />
                {isAdmin && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={page.url.startsWith('/admin/users')}>
                                    <Link href="/admin/users" prefetch>
                                        <Users />
                                        <span>Users</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={page.url.startsWith('/admin/upi-ids')}>
                                    <Link href="/admin/upi-ids" prefetch>
                                        <Smartphone />
                                        <span>Admin UPI IDs</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={page.url.startsWith('/admin/usdt-addresses')}>
                                    <Link href="/admin/usdt-addresses" prefetch>
                                        <Coins />
                                        <span>Admin USDT</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
