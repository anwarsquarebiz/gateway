import { tableTheadClassName } from '@/lib/table-thead';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginator, type PaginationLink } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface MerchantRow {
    id: number;
    name: string;
    merchant_id: number | null;
    created_at: string | null;
}

interface MerchantsPageProps {
    merchants: Paginator<MerchantRow>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Merchants',
        href: '/merchants',
    },
];

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

export default function MerchantsPage({ merchants }: MerchantsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Merchants" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Merchants</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Minimal merchant list for the logged-in broker.</p>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[36rem] text-left text-sm">
                            <thead className={tableTheadClassName}>
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Merchant ID</th>
                                    <th className="px-4 py-3 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {merchants.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-muted-foreground px-4 py-10 text-center">
                                            No merchants found.
                                        </td>
                                    </tr>
                                ) : (
                                    merchants.data.map((row) => (
                                        <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                            <td className="px-4 py-3">{row.name}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.merchant_id ?? '—'}</td>
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

                <PaginationBar links={merchants.links} />
            </div>
        </AppLayout>
    );
}

