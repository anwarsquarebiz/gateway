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

interface EditProps {
    upiId: {
        id: number;
        upi_id: string;
        receiving_amount_limit: string;
    };
}

interface FormData {
    upi_id: string;
    receiving_amount_limit: string;
}

export default function AdminUpiIdsEdit({ upiId }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin UPI IDs', href: '/admin/upi-ids' },
        { title: 'Edit UPI ID', href: `/admin/upi-ids/${upiId.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm<FormData>({
        upi_id: upiId.upi_id,
        receiving_amount_limit: upiId.receiving_amount_limit,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.upi-ids.update', upiId.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit UPI ID" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Edit UPI ID</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Update this receiving UPI entry.</p>
                    <Button variant="outline" className="mt-3" asChild>
                        <Link href={route('admin.upi-ids.index')} prefetch>
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>UPI details</CardTitle>
                        <CardDescription>Changes apply immediately.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="upi_id">UPI ID</Label>
                                <Input
                                    id="upi_id"
                                    autoComplete="off"
                                    value={data.upi_id}
                                    onChange={(e) => setData('upi_id', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.upi_id} />
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
                                Save changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
