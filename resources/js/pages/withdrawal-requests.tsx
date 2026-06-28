import { tableTheadClassName } from '@/lib/table-thead';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink } from '@/types';
import { Head, Link } from '@inertiajs/react';

/** Mirrors `WithdrawalRequest` serialized from `MerchantWithdrawalRequestController`. */
interface WithdrawalRequestRow {
    id: number;
    user_id: number;
    merchant_id: number | null;
    method: string;
    amount: string;
    fee_percent: string;
    fee_fixed: string;
    fee_amount: string;
    total_deducted: string;
    status: string;
    created_at: string | null;
    updated_at: string | null;
}

interface WithdrawalRequestsPageProps {
    withdrawalRequests: Paginator<WithdrawalRequestRow>;
    isAdmin: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Withdrawal requests',
        href: '/withdrawal-requests',
    },
];

function formatMoney(value: string): string {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return value;
    }
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleString();
}

function formatMethod(method: string): string {
    return method.toUpperCase();
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

export default function WithdrawalRequestsPage({ withdrawalRequests, isAdmin }: WithdrawalRequestsPageProps) {
    const rows = withdrawalRequests.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdrawal requests" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Withdrawal requests</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isAdmin
                            ? 'Withdrawal requests submitted by merchant accounts.'
                            : 'Your withdrawal requests submitted from the Withdraw page.'}
                    </p>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[56rem] text-left text-sm">
                            <thead className={tableTheadClassName}>
                                <tr>
                                    <th className="px-4 py-3 font-medium">ID</th>
                                    {isAdmin && <th className="px-4 py-3 font-medium">Merchant</th>}
                                    <th className="px-4 py-3 font-medium">Method</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    <th className="px-4 py-3 text-right font-medium">Fee</th>
                                    <th className="px-4 py-3 text-right font-medium">Total deducted</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={isAdmin ? 8 : 7}
                                            className="text-muted-foreground px-4 py-10 text-center"
                                        >
                                            No withdrawal requests yet.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                                            {isAdmin && (
                                                <td className="px-4 py-3 font-mono text-xs">{row.merchant_id ?? '—'}</td>
                                            )}
                                            <td className="px-4 py-3">{formatMethod(row.method)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.fee_amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatMoney(row.total_deducted)}
                                            </td>
                                            <td className="px-4 py-3 capitalize">{row.status}</td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                                {formatDateTime(row.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PaginationBar links={withdrawalRequests.links} />
            </div>
        </AppLayout>
    );
}
