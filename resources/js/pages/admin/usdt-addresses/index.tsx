import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { tableTheadClassName } from '@/lib/table-thead';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin USDT addresses', href: '/admin/usdt-addresses' }];

export interface AdminUsdtAddressRow {
    id: number;
    public_address: string;
    receiving_amount_limit: string | null;
    created_at: string | null;
}

interface IndexProps {
    addresses: Paginator<AdminUsdtAddressRow>;
}

function PaginationBar({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-1">
            {links.map((link, i) => {
                const label = <span dangerouslySetInnerHTML={{ __html: link.label }} />;
                const className = link.active
                    ? 'bg-primary text-primary-foreground inline-flex min-w-8 items-center justify-center rounded-md px-3 py-1 text-sm font-medium'
                    : 'hover:bg-muted text-muted-foreground inline-flex min-w-8 items-center justify-center rounded-md px-3 py-1 text-sm';

                return link.url ? (
                    <Link key={i} href={link.url} preserveScroll className={className}>
                        {label}
                    </Link>
                ) : (
                    <span key={i} className={className}>
                        {label}
                    </span>
                );
            })}
        </div>
    );
}

const FLASH: Record<string, string> = {
    'usdt-address-created': 'USDT address was added.',
    'usdt-address-updated': 'USDT address was updated.',
    'usdt-address-deleted': 'USDT address was removed.',
};

export default function AdminUsdtAddressesIndex({ addresses }: IndexProps) {
    const page = usePage<SharedData & { flash?: { status?: string | null } }>();
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        const s = page.props.flash?.status;
        setFlashMessage(s && FLASH[s] ? FLASH[s] : null);
    }, [page.props.flash?.status]);

    const deleteError = (page.props.errors as { delete?: string }).delete;

    const confirmDelete = (row: AdminUsdtAddressRow) => {
        if (!confirm(`Remove USDT address ${row.public_address.slice(0, 12)}…? This cannot be undone.`)) {
            return;
        }
        router.delete(route('admin.usdt-addresses.destroy', row.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin USDT addresses" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Admin USDT addresses</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            USDT receiving addresses and optional amount range labels for your admin account.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.usdt-addresses.create')} prefetch>
                            <Plus className="size-4" />
                            Add address
                        </Link>
                    </Button>
                </div>

                {flashMessage && <div className="bg-muted rounded-lg border px-4 py-3 text-sm">{flashMessage}</div>}
                <InputError message={deleteError} />

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[40rem] text-left text-sm">
                            <thead className={tableTheadClassName}>
                                <tr>
                                    <th className="px-4 py-3 font-medium">Address</th>
                                    <th className="px-4 py-3 font-medium">Amount limit</th>
                                    <th className="px-4 py-3 font-medium">Added</th>
                                    <th className="px-4 py-3 w-28 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addresses.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-muted-foreground px-4 py-10 text-center">
                                            No USDT addresses yet.
                                        </td>
                                    </tr>
                                ) : (
                                    addresses.data.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="max-w-[20rem] truncate px-4 py-3 font-mono text-xs" title={row.public_address}>
                                                {row.public_address}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 text-xs">
                                                {row.receiving_amount_limit ?? '—'}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap text-xs">
                                                {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('admin.usdt-addresses.edit', row.id)} prefetch>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => confirmDelete(row)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PaginationBar links={addresses.links} />
            </div>
        </AppLayout>
    );
}
