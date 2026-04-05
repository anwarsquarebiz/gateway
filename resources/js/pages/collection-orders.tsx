import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type CollectionOrderStatus = 'created' | 'submitted' | 'success' | 'failed';

export interface CollectionOrderRow {
    id: number;
    merchant_id: number;
    order_no: string;
    merchant_order_no: string;
    payment_type: 'inr' | 'usdt' | null;
    receiving_upi_id: string | null;
    receiving_usdt_address: string | null;
    nowpayments_payment_id: string | null;
    nowpayments_pay_amount: string | null;
    nowpayments_pay_currency: string | null;
    amount: string;
    fee: string;
    final_amount: string;
    status: CollectionOrderStatus;
    callback_status: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface CollectionOrdersProps {
    orders: Paginator<CollectionOrderRow>;
    isAdmin?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Collection orders',
        href: '/collection-orders',
    },
];

const FLASH: Record<string, string> = {
    'collection-order-accepted': 'Order approved. Status set to success and merchant callback sent.',
    'collection-order-rejected': 'Order rejected. Status set to failed and merchant callback sent.',
};

function formatMoney(value: string): string {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return value;
    }
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
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

export default function CollectionOrders({ orders, isAdmin = false }: CollectionOrdersProps) {
    const page = usePage<SharedData & { flash?: { status?: string | null }; isAdmin?: boolean }>();
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    const isAdminUser =
        page.props.auth?.user?.role === 'admin' || page.props.isAdmin === true || isAdmin;

    useEffect(() => {
        const s = page.props.flash?.status;
        setFlashMessage(s && FLASH[s] ? FLASH[s] : null);
    }, [page.props.flash?.status]);

    const reviewError = (page.props.errors as { review?: string }).review;

    const colSpan = isAdminUser ? 12 : 11;

    const canReviewOrder = (status: CollectionOrderStatus) => status === 'created' || status === 'submitted';

    const acceptOrder = (row: CollectionOrderRow) => {
        router.post(route('admin.collection-orders.accept', row.id), {}, { preserveScroll: true });
    };

    const rejectOrder = (row: CollectionOrderRow) => {
        if (!confirm(`Reject order ${row.order_no} and notify the merchant?`)) {
            return;
        }
        router.post(route('admin.collection-orders.reject', row.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collection orders" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Collection orders</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isAdminUser
                            ? 'All merchants’ collection orders. Accept or reject open orders (created or submitted).'
                            : 'Payment collection orders for your merchant account.'}
                    </p>
                </div>

                {flashMessage && <div className="bg-muted rounded-lg border px-4 py-3 text-sm">{flashMessage}</div>}
                <InputError message={reviewError} />

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[68rem] text-left text-sm">
                            <thead className="bg-muted/50 border-border border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Order no</th>
                                    <th className="px-4 py-3 font-medium">Merchant order no</th>
                                    <th className="px-4 py-3 font-medium">Merchant ID</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Pay to</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    <th className="px-4 py-3 text-right font-medium">Fee</th>
                                    <th className="px-4 py-3 text-right font-medium">Final</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Callback</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                    {isAdminUser && <th className="px-4 py-3 w-24 font-medium text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={colSpan} className="text-muted-foreground px-4 py-10 text-center">
                                            No collection orders yet.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3 font-mono text-xs">{row.order_no}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.merchant_order_no}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.merchant_id}</td>
                                            <td className="text-muted-foreground px-4 py-3 text-xs uppercase">
                                                {row.payment_type ?? '—'}
                                            </td>
                                            <td
                                                className="text-muted-foreground max-w-[14rem] truncate px-4 py-3 font-mono text-xs"
                                                title={
                                                    row.payment_type === 'inr'
                                                        ? (row.receiving_upi_id ?? '')
                                                        : row.payment_type === 'usdt'
                                                          ? (row.receiving_usdt_address ?? '')
                                                          : ''
                                                }
                                            >
                                                {row.payment_type === 'inr'
                                                    ? (row.receiving_upi_id ?? '—')
                                                    : row.payment_type === 'usdt'
                                                      ? (row.receiving_usdt_address ?? '—')
                                                      : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.fee)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.final_amount)}</td>
                                            <td className="px-4 py-3 capitalize">{row.status}</td>
                                            <td className="text-muted-foreground px-4 py-3">{row.callback_status ?? '—'}</td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                                {formatDate(row.created_at)}
                                            </td>
                                            {isAdminUser && (
                                                <td className="px-4 py-3 text-right">
                                                    {canReviewOrder(row.status) ? (
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                                aria-label="Accept order"
                                                                onClick={() => acceptOrder(row)}
                                                            >
                                                                <CheckCircle2 className="size-5" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:bg-destructive/10"
                                                                aria-label="Reject order"
                                                                onClick={() => rejectOrder(row)}
                                                            >
                                                                <XCircle className="size-5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                            )}
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
