import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface CommissionRow {
    id: number;
    user_id: number | null;
    amount: string;
    percentage: string;
    commission_amount: string;
    created_at: string | null;
}

interface CommissionPageProps {
    commissions: CommissionRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Commission',
        href: '/commission',
    },
];

function formatMoney(value: string): string {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return value;
    }
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatPercent(value: string): string {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return value;
    }
    return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleString();
}

export default function CommissionPage({ commissions }: CommissionPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Commission" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Commission</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Broker commission records by amount and percentage.</p>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[52rem] text-left text-sm">
                            <thead className="bg-muted/50 border-border border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">ID</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    <th className="px-4 py-3 text-right font-medium">Percentage</th>
                                    <th className="px-4 py-3 text-right font-medium">Commission amount</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">
                                            No commission records yet.
                                        </td>
                                    </tr>
                                ) : (
                                    commissions.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(row.amount)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{formatPercent(row.percentage)}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatMoney(row.commission_amount)}
                                            </td>
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
            </div>
        </AppLayout>
    );
}

