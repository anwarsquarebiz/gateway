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
    const isAdmin = page.props.auth.user?.role === 'admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
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
                <NavMain items={mainNavItems} />
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
