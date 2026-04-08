import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type UserRole } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/admin/users' },
    { title: 'Add user', href: '/admin/users/create' },
];

interface CreateUserForm {
    name: string;
    email: string;
    role: UserRole;
    broker_id: string;
    password: string;
    password_confirmation: string;
    payin_fee_percent: string;
    payout_fee_percent: string;
}

interface BrokerOption {
    id: number;
    name: string;
    email: string;
}

interface CreateProps {
    brokers: BrokerOption[];
}

export default function AdminCreateUser({ brokers }: CreateProps) {
    const { data, setData, post, processing, errors, reset, transform } = useForm<CreateUserForm>({
        name: '',
        email: '',
        role: 'merchant',
        broker_id: 'none',
        password: '',
        password_confirmation: '',
        payin_fee_percent: '11.00',
        payout_fee_percent: '4.00',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({
            ...d,
            broker_id: d.role !== 'merchant' || d.broker_id === 'none' ? null : d.broker_id,
        }));
        post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add user" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Add user</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Create a new merchant, broker, or admin account. Merchant IDs are assigned automatically for merchant
                        accounts.
                    </p>
                    <Button variant="outline" className="mt-3" asChild>
                        <Link href={route('admin.users.index')} prefetch>
                            Back to users
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>User details</CardTitle>
                        <CardDescription>New users receive a verified email flag so they can sign in immediately.</CardDescription>
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
                                    onValueChange={(v) => {
                                        const role = v as UserRole;
                                        setData('role', role);
                                        if (role !== 'merchant') {
                                            setData('broker_id', 'none');
                                        }
                                    }}
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

                            {data.role === 'merchant' ? (
                                <div className="space-y-2">
                                    <Label>Broker</Label>
                                    <Select
                                        value={data.broker_id}
                                        onValueChange={(v) => setData('broker_id', v)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="No broker (direct)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No broker (direct)</SelectItem>
                                            {brokers.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
                                                    {b.name} ({b.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.broker_id} />
                                </div>
                            ) : null}

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

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
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

                            <Button type="submit" disabled={processing}>
                                {processing ? <Loader2 className="size-4 animate-spin" /> : null}
                                Create user
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
