import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink } from '@/types';
import { Head, Link } from '@inertiajs/react';

export type FundDetailType = 'debit' | 'credit';

export interface FundDetailRow {
    id: number;
    merchant_id: number | null;
    type: FundDetailType;
    transaction_id: string;
    amount: string;
    fee: string;
    final_amount: string;
    balance_before: string;
    balance_after: string;
    transaction_date: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface FundDetailsProps {
    funds: Paginator<FundDetailRow>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Fund details',
        href: '/fund-details',
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

export default function FundDetails({ funds }: FundDetailsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fund details" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Fund details</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Ledger movements: debits, credits, fees, and running balances.</p>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[64rem] text-left text-sm">
                            <thead className="bg-muted/50 border-border border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                                    <th className="px-4 py-3 font-medium">Merchant ID</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    <th className="px-4 py-3 text-right font-medium">Fee</th>
                                    <th className="px-4 py-3 text-right font-medium">Final</th>
                                    <th className="px-4 py-3 text-right font-medium">Before</th>
                                    <th className="px-4 py-3 text-right font-medium">After</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funds.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-muted-foreground px-4 py-10 text-center">
                                            No fund details yet.
                                        </td>
                                    </tr>
                                ) : (
                                    funds.data.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3 capitalize">
                                                <span
                                                    className={
                                                        row.type === 'credit'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.transaction_id}</td>
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                                                {row.merchant_id ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.fee)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.final_amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.balance_before)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.balance_after)}</td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                                {formatDateTime(row.transaction_date)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PaginationBar links={funds.links} />
            </div>
        </AppLayout>
    );
}
