import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin USDT addresses', href: '/admin/usdt-addresses' },
    { title: 'Add address', href: '/admin/usdt-addresses/create' },
];

interface FormData {
    public_address: string;
    receiving_amount_limit: string;
}

export default function AdminUsdtAddressesCreate() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        public_address: '',
        receiving_amount_limit: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.usdt-addresses.store'), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add USDT address" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Add USDT address</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Store a receiving address and an optional amount range label (e.g. 10 - 50k).
                    </p>
                    <Button variant="outline" className="mt-3" asChild>
                        <Link href={route('admin.usdt-addresses.index')} prefetch>
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Address</CardTitle>
                        <CardDescription>Entries are visible only to your admin account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="public_address">Public address</Label>
                                <Input
                                    id="public_address"
                                    autoComplete="off"
                                    placeholder="TRC20 / ERC20 / etc."
                                    value={data.public_address}
                                    onChange={(e) => setData('public_address', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.public_address} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="receiving_amount_limit">Receiving amount limit</Label>
                                <Input
                                    id="receiving_amount_limit"
                                    autoComplete="off"
                                    placeholder="e.g. 10 - 50k"
                                    value={data.receiving_amount_limit}
                                    onChange={(e) => setData('receiving_amount_limit', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.receiving_amount_limit} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? <Loader2 className="size-4 animate-spin" /> : null}
                                Save
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
