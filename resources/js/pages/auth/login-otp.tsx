import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { type SharedData } from '@/types';

interface LoginOtpProps {
    emailMasked: string;
}

export default function LoginOtp({ emailMasked }: LoginOtpProps) {
    const flashStatus = usePage<SharedData>().props.flash?.status;

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.otp.verify'));
    };

    const resend = () => {
        router.post(route('login.otp.resend'), {}, { preserveScroll: true });
    };

    return (
        <AuthLayout
            title="Check your email"
            description={`We sent a 6-digit code to ${emailMasked}. Enter it below to finish signing in.`}
        >
            <Head title="Sign-in code" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Verification code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            required
                            autoFocus
                            autoComplete="one-time-code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="text-center font-mono text-lg tracking-widest"
                        />
                        <InputError message={errors.code} />
                    </div>

                    <Button type="submit" className="w-full" disabled={processing || data.code.length !== 6}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Continue
                    </Button>

                    <div className="text-muted-foreground flex flex-col gap-2 text-center text-sm">
                        <button
                            type="button"
                            className="text-foreground underline-offset-4 hover:underline"
                            onClick={resend}
                            disabled={processing}
                        >
                            Resend code
                        </button>
                        <Link href={route('login')} className="hover:underline">
                            Back to login
                        </Link>
                    </div>
                </div>
            </form>

            {flashStatus === 'login-otp-sent' && (
                <div className="mt-4 text-center text-sm font-medium text-green-600">A new code has been sent.</div>
            )}
        </AuthLayout>
    );
}
