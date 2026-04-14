import { tableTheadClassName } from '@/lib/table-thead';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink } from '@/types';
import { Head, Link } from '@inertiajs/react';

export type PaymentOrderStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface PaymentOrderRow {
    id: number;
    merchant_id: number | null;
    transaction_id: string;
    payment_type: string | null;
    amount: string;
    fee: string | null;
    final_amount: string | null;
    total_amount: string | null;
    usdt_wallet_address: string;
    bank_name: string;
    account_holder: string;
    account_number: string;
    ifsc_code: string;
    upi_id: string | null;
    callback_url: string | null;
    status: PaymentOrderStatus;
    created_at: string | null;
    updated_at: string | null;
}

interface PaymentOrdersProps {
    orders: Paginator<PaymentOrderRow>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment orders',
        href: '/payment-orders',
    },
];

function formatMoney(value: string | null): string {
    if (value === null || value === '') {
        return '—';
    }
    const n = Number(value);
    if (Number.isNaN(n)) {
        return value;
    }
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatCell(value: string | null): string {
    if (value === null || value === '') {
        return '—';
    }
    return value;
}

function formatDate(iso: string | null): string {
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

export default function PaymentOrders({ orders }: PaymentOrdersProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment orders" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Payment orders</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Bank payout and USDT wallet details per transaction.</p>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[80rem] text-left text-sm">
                            <thead className={tableTheadClassName}>
                                <tr>
                                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                                    <th className="px-4 py-3 font-medium">Merchant ID</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    <th className="px-4 py-3 text-right font-medium">Fee</th>
                                    <th className="px-4 py-3 text-right font-medium">Net (final)</th>
                                    <th className="px-4 py-3 font-medium">USDT wallet</th>
                                    <th className="px-4 py-3 font-medium">Bank</th>
                                    <th className="px-4 py-3 font-medium">Account holder</th>
                                    <th className="px-4 py-3 font-medium">Account no.</th>
                                    <th className="px-4 py-3 font-medium">IFSC</th>
                                    <th className="px-4 py-3 font-medium">UPI ID</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="text-muted-foreground px-4 py-10 text-center">
                                            No payment orders yet.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3 font-mono text-xs">{row.transaction_id}</td>
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                                                {row.merchant_id ?? '—'}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 text-xs uppercase">
                                                {formatCell(row.payment_type)}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.fee)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatMoney(row.final_amount ?? row.total_amount)}
                                            </td>
                                            <td
                                                className="max-w-[12rem] truncate px-4 py-3 font-mono text-xs"
                                                title={row.usdt_wallet_address || undefined}
                                            >
                                                {formatCell(row.usdt_wallet_address)}
                                            </td>
                                            <td className="px-4 py-3">{formatCell(row.bank_name)}</td>
                                            <td className="px-4 py-3">{formatCell(row.account_holder)}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{formatCell(row.account_number)}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{formatCell(row.ifsc_code)}</td>
                                            <td className="max-w-[10rem] truncate px-4 py-3 font-mono text-xs" title={row.upi_id || undefined}>
                                                {formatCell(row.upi_id)}
                                            </td>
                                            <td className="px-4 py-3 capitalize">{row.status}</td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">{formatDate(row.created_at)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PaginationBar links={orders.links} />
            </div>
        </AppLayout>
    );
}
