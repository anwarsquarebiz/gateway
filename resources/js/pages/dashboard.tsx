import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Copy, KeyRound, Loader2, RefreshCw, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export interface MerchantCredentials {
    payin_api_key: string | null;
    payout_api_key: string | null;
    payin_fee_percent: string;
    payout_fee_percent: string;
}

interface DashboardProps {
    walletBalance: string | null;
    walletBalanceLabel: string;
    merchantCredentials: MerchantCredentials | null;
}

const FLASH: Record<string, string> = {
    'payin-api-key-regenerated': 'Your Payin API key was regenerated. Update any integrations using the old key.',
    'payout-api-key-regenerated': 'Your Payout API key was regenerated. Update any integrations using the old key.',
};

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
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard({ walletBalance, walletBalanceLabel, merchantCredentials }: DashboardProps) {
    const page = usePage<SharedData & { flash?: { status?: string | null } }>();
    const [flashMessage, setFlashMessage] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState<'payin' | 'payout' | null>(null);

    useEffect(() => {
        const s = page.props.flash?.status;
        setFlashMessage(s && FLASH[s] ? FLASH[s] : null);
    }, [page.props.flash?.status]);

    const copyKey = async (label: string, value: string | null) => {
        if (!value) {
            return;
        }
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            window.prompt(`Copy ${label}:`, value);
        }
    };

    const regenerate = (kind: 'payin' | 'payout') => {
        const routeName =
            kind === 'payin' ? 'merchant.api-keys.regenerate-payin' : 'merchant.api-keys.regenerate-payout';
        if (!confirm(`Regenerate ${kind === 'payin' ? 'Payin' : 'Payout'} API key? The current key will stop working.`)) {
            return;
        }
        setRegenerating(kind);
        router.post(
            route(routeName),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRegenerating(null),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {flashMessage && <div className="bg-muted rounded-lg border px-4 py-3 text-sm">{flashMessage}</div>}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-base font-medium">{walletBalanceLabel}</CardTitle>
                                <CardDescription>Current available balance</CardDescription>
                            </div>
                            <Wallet className="text-muted-foreground size-8 shrink-0" aria-hidden />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold tabular-nums tracking-tight">
                                {walletBalance !== null ? formatMoney(walletBalance) : '—'}
                            </p>
                        </CardContent>
                    </Card>
                    {merchantCredentials ? (
                        <>
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-xs">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">Payin fee</CardTitle>
                                    <CardDescription>Percentage charged on payin</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-semibold tabular-nums tracking-tight">
                                        {formatPercent(merchantCredentials.payin_fee_percent)}%
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-xs">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">Payout fee</CardTitle>
                                    <CardDescription>Percentage charged on payout</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-semibold tabular-nums tracking-tight">
                                        {formatPercent(merchantCredentials.payout_fee_percent)}%
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                        </>
                    )}
                </div>

                {merchantCredentials && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border shadow-xs">
                        <CardHeader>
                            <div className="flex flex-row items-center gap-2">
                                <KeyRound className="text-muted-foreground size-5" aria-hidden />
                                <div>
                                    <CardTitle className="text-base font-medium">API keys</CardTitle>
                                    <CardDescription>Authenticate Payin and Payout requests. Store these securely.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <Label>Payin API key</Label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Input
                                        readOnly
                                        className="font-mono text-xs"
                                        value={merchantCredentials.payin_api_key ?? ''}
                                        placeholder="Not generated yet"
                                    />
                                    <div className="flex shrink-0 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!merchantCredentials.payin_api_key}
                                            onClick={() => copyKey('Payin API key', merchantCredentials.payin_api_key)}
                                        >
                                            <Copy className="size-4" />
                                            Copy
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={regenerating !== null}
                                            onClick={() => regenerate('payin')}
                                        >
                                            {regenerating === 'payin' ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="size-4" />
                                            )}
                                            {merchantCredentials.payin_api_key ? 'Regenerate' : 'Generate'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Payout API key</Label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Input
                                        readOnly
                                        className="font-mono text-xs"
                                        value={merchantCredentials.payout_api_key ?? ''}
                                        placeholder="Not generated yet"
                                    />
                                    <div className="flex shrink-0 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!merchantCredentials.payout_api_key}
                                            onClick={() => copyKey('Payout API key', merchantCredentials.payout_api_key)}
                                        >
                                            <Copy className="size-4" />
                                            Copy
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={regenerating !== null}
                                            onClick={() => regenerate('payout')}
                                        >
                                            {regenerating === 'payout' ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="size-4" />
                                            )}
                                            {merchantCredentials.payout_api_key ? 'Regenerate' : 'Generate'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!merchantCredentials && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
