import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type UserRole } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Copy, Loader2, RefreshCw } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface EditUserProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: UserRole;
        merchant_id: number | null;
        payin_api_key: string | null;
        payout_api_key: string | null;
        payin_fee_percent: string;
        payout_fee_percent: string;
    };
}

interface EditUserForm {
    name: string;
    email: string;
    role: UserRole;
    password: string;
    password_confirmation: string;
    payin_fee_percent: string;
    payout_fee_percent: string;
}

const FLASH: Record<string, string> = {
    'payin-api-key-regenerated': 'Payin API key was regenerated for this user.',
    'payout-api-key-regenerated': 'Payout API key was regenerated for this user.',
};

export default function AdminEditUser({ user }: EditUserProps) {
    const page = usePage<SharedData & { flash?: { status?: string | null } }>();
    const [flashMessage, setFlashMessage] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState<'payin' | 'payout' | null>(null);

    useEffect(() => {
        const s = page.props.flash?.status;
        setFlashMessage(s && FLASH[s] ? FLASH[s] : null);
    }, [page.props.flash?.status]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/admin/users' },
        { title: `Edit: ${user.name}`, href: `/admin/users/${user.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm<EditUserForm>({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        password_confirmation: '',
        payin_fee_percent: user.payin_fee_percent,
        payout_fee_percent: user.payout_fee_percent,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.users.update', user.id), {
            preserveScroll: true,
        });
    };

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

    const regenerateKey = (kind: 'payin' | 'payout') => {
        if (
            !confirm(
                `Regenerate ${kind === 'payin' ? 'Payin' : 'Payout'} API key for ${user.name}? The previous key will stop working.`,
            )
        ) {
            return;
        }
        setRegenerating(kind);
        const routeName =
            kind === 'payin' ? 'admin.users.regenerate-payin-api-key' : 'admin.users.regenerate-payout-api-key';
        router.post(route(routeName, user.id), {}, { preserveScroll: true, onFinish: () => setRegenerating(null) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit user</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Update profile, fees, and role. Leave password blank to keep the current password. Merchant ID is
                            assigned automatically when the role is merchant.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.users.index')} prefetch>
                            Back to list
                        </Link>
                    </Button>
                </div>

                {flashMessage && <div className="bg-muted max-w-lg rounded-lg border px-4 py-3 text-sm">{flashMessage}</div>}

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>
                            {user.role === 'merchant' && user.merchant_id !== null ? (
                                <span>
                                    Merchant ID: <span className="font-mono text-foreground">{user.merchant_id}</span>
                                </span>
                            ) : (
                                <span>No merchant ID (not a merchant).</span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="off"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(v) => setData('role', v as UserRole)}
                                    disabled={processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="merchant">Merchant</SelectItem>
                                        <SelectItem value="broker">Broker</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="payin_fee_percent">Payin fee (%)</Label>
                                    <Input
                                        id="payin_fee_percent"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        value={data.payin_fee_percent}
                                        onChange={(e) => setData('payin_fee_percent', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.payin_fee_percent} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payout_fee_percent">Payout fee (%)</Label>
                                    <Input
                                        id="payout_fee_percent"
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={100}
                                        value={data.payout_fee_percent}
                                        onChange={(e) => setData('payout_fee_percent', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.payout_fee_percent} />
                                </div>
                            </div>

                            <div className="border-border space-y-2 border-t pt-4">
                                <p className="text-muted-foreground text-sm">New password (optional)</p>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Leave blank to keep current"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? <Loader2 className="size-4 animate-spin" /> : null}
                                Save changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>API keys</CardTitle>
                        <CardDescription>
                            Payin and Payout keys are created automatically for new users. Regenerate if a key is missing or
                            compromised.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <Label>Payin API key</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input readOnly className="font-mono text-xs" value={user.payin_api_key ?? ''} placeholder="Not set" />
                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!user.payin_api_key}
                                        onClick={() => copyKey('Payin API key', user.payin_api_key)}
                                    >
                                        <Copy className="size-4" />
                                        Copy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={regenerating !== null}
                                        onClick={() => regenerateKey('payin')}
                                    >
                                        {regenerating === 'payin' ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="size-4" />
                                        )}
                                        {user.payin_api_key ? 'Regenerate' : 'Generate'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payout API key</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input readOnly className="font-mono text-xs" value={user.payout_api_key ?? ''} placeholder="Not set" />
                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!user.payout_api_key}
                                        onClick={() => copyKey('Payout API key', user.payout_api_key)}
                                    >
                                        <Copy className="size-4" />
                                        Copy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={regenerating !== null}
                                        onClick={() => regenerateKey('payout')}
                                    >
                                        {regenerating === 'payout' ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="size-4" />
                                        )}
                                        {user.payout_api_key ? 'Regenerate' : 'Generate'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
