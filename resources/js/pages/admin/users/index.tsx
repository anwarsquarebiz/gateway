import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/admin/users' }];

export interface AdminUserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    merchant_id: number | null;
    payin_fee_percent: string;
    payout_fee_percent: string;
    created_at: string | null;
}

interface IndexProps {
    users: Paginator<AdminUserRow>;
}

function formatPercent(value: string): string {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return value;
    }
    return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
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
    'user-created': 'User was created successfully.',
    'user-updated': 'User was updated successfully.',
    'user-deleted': 'User was deleted.',
};

export default function AdminUsersIndex({ users }: IndexProps) {
    const page = usePage<SharedData & { flash?: { status?: string | null } }>();
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        const s = page.props.flash?.status;
        setFlashMessage(s && FLASH[s] ? FLASH[s] : null);
    }, [page.props.flash?.status]);

    const deleteError = (page.props.errors as { delete?: string }).delete;

    const confirmDelete = (row: AdminUserRow) => {
        if (!confirm(`Delete user ${row.name} (${row.email})? This cannot be undone.`)) {
            return;
        }
        router.delete(route('admin.users.destroy', row.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Manage merchant, broker, and admin accounts.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.users.create')} prefetch>
                            <Plus className="size-4" />
                            Add user
                        </Link>
                    </Button>
                </div>

                {flashMessage && <div className="bg-muted rounded-lg border px-4 py-3 text-sm">{flashMessage}</div>}
                <InputError message={deleteError} />

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[48rem] text-left text-sm">
                            <thead className="bg-muted/50 border-border border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Merchant ID</th>
                                    <th className="px-4 py-3 text-right font-medium">Payin fee</th>
                                    <th className="px-4 py-3 text-right font-medium">Payout fee</th>
                                    <th className="px-4 py-3 font-medium">Joined</th>
                                    <th className="px-4 py-3 font-medium w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-muted-foreground px-4 py-10 text-center">
                                            No users yet.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3">{row.name}</td>
                                            <td className="px-4 py-3">{row.email}</td>
                                            <td className="px-4 py-3 capitalize">{row.role}</td>
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                                                {row.merchant_id ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-xs">{formatPercent(row.payin_fee_percent)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-xs">{formatPercent(row.payout_fee_percent)}</td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap text-xs">
                                                {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('admin.users.edit', row.id)} prefetch>
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

                <PaginationBar links={users.links} />
            </div>
        </AppLayout>
    );
}
