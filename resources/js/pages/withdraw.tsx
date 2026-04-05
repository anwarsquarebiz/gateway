import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Withdraw', href: '/withdraw' }];

export interface BankAccountRow {
    id: number;
    bank_name: string;
    account_holder: string;
    account_number: string;
    ifsc_code: string;
}

export interface UsdtWalletRow {
    id: number;
    public_address: string;
    blockchain: string;
    blockchain_label: string;
}

export interface UserUpiIdRow {
    id: number;
    upi_id: string;
}

interface WithdrawProps {
    currentBalance: string;
    feePercent: number;
    feeFixedInr: number;
    bankAccounts: BankAccountRow[];
    usdtWallets: UsdtWalletRow[];
    userUpiIds: UserUpiIdRow[];
}

function formatInr(value: number): string {
    return `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseAmount(s: string): number {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
}

const FLASH_MESSAGES: Record<string, string> = {
    'verification-otp-sent': 'A verification code was sent to your email.',
    'withdrawal-submitted': 'Your withdrawal request was submitted and is pending review.',
    'bank-account-saved': 'Bank account added.',
    'bank-account-updated': 'Bank account updated.',
    'bank-account-deleted': 'Bank account removed.',
    'usdt-wallet-saved': 'USDT wallet added.',
    'usdt-wallet-updated': 'USDT wallet updated.',
    'usdt-wallet-deleted': 'USDT wallet removed.',
    'upi-id-saved': 'UPI ID added.',
    'upi-id-updated': 'UPI ID updated.',
    'upi-id-deleted': 'UPI ID removed.',
};

export default function Withdraw({
    currentBalance,
    feePercent,
    feeFixedInr,
    bankAccounts,
    usdtWallets,
    userUpiIds,
}: WithdrawProps) {
    const page = usePage<SharedData & { flash?: { status?: string | null } }>();
    const flashStatus = page.props.flash?.status;
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        if (flashStatus && FLASH_MESSAGES[flashStatus]) {
            setFlashMessage(FLASH_MESSAGES[flashStatus]);
        } else if (flashStatus) {
            setFlashMessage(flashStatus);
        } else {
            setFlashMessage(null);
        }
    }, [flashStatus]);

    const balanceNum = parseAmount(currentBalance);

    const withdrawForm = useForm({
        method: 'bank' as 'bank' | 'usdt' | 'upi',
        bank_account_id: '',
        usdt_wallet_id: '',
        user_upi_id: '',
        amount: '',
        payment_password: '',
        otp_code: '',
    });

    withdrawForm.transform((data) => {
        const base = {
            method: data.method,
            amount: data.amount,
            payment_password: data.payment_password,
            otp_code: data.otp_code,
        };
        if (data.method === 'bank') {
            return { ...base, bank_account_id: Number(data.bank_account_id) };
        }
        if (data.method === 'usdt') {
            return { ...base, usdt_wallet_id: Number(data.usdt_wallet_id) };
        }
        return { ...base, user_upi_id: Number(data.user_upi_id) };
    });

    const amountNum = parseAmount(withdrawForm.data.amount);
    const feeVariable = (amountNum * feePercent) / 100;
    const totalFee = feeVariable + feeFixedInr;
    const totalDeducted = amountNum + totalFee;

    const [otpSending, setOtpSending] = useState(false);

    const sendWithdrawOtp = () => {
        setOtpSending(true);
        router.post(
            route('verification.send-otp'),
            { purpose: 'withdraw' },
            {
                preserveScroll: true,
                onFinish: () => setOtpSending(false),
            },
        );
    };

    const bankAddForm = useForm({
        bank_name: '',
        account_holder: '',
        account_number: '',
        ifsc_code: '',
        otp_code: '',
    });

    const bankEditForm = useForm({
        bank_name: '',
        account_holder: '',
        account_number: '',
        ifsc_code: '',
        otp_code: '',
    });

    const usdtAddForm = useForm({
        public_address: '',
        blockchain: 'erc20' as 'erc20' | 'trc20',
        otp_code: '',
    });

    const usdtEditForm = useForm({
        public_address: '',
        blockchain: 'erc20' as 'erc20' | 'trc20',
        otp_code: '',
    });

    const bankDeleteForm = useForm({
        password: '',
    });

    const usdtDeleteForm = useForm({
        password: '',
    });

    const upiAddForm = useForm({
        upi_id: '',
        otp_code: '',
    });

    const upiEditForm = useForm({
        upi_id: '',
        otp_code: '',
    });

    const upiDeleteForm = useForm({
        password: '',
    });

    const [addBankOpen, setAddBankOpen] = useState(false);
    const [editBankOpen, setEditBankOpen] = useState(false);
    const [editBank, setEditBank] = useState<BankAccountRow | null>(null);

    const [addUsdtOpen, setAddUsdtOpen] = useState(false);
    const [editUsdtOpen, setEditUsdtOpen] = useState(false);
    const [editUsdt, setEditUsdt] = useState<UsdtWalletRow | null>(null);

    const [deleteBank, setDeleteBank] = useState<BankAccountRow | null>(null);
    const [deleteUsdt, setDeleteUsdt] = useState<UsdtWalletRow | null>(null);

    const [addUpiOpen, setAddUpiOpen] = useState(false);
    const [editUpiOpen, setEditUpiOpen] = useState(false);
    const [editUpi, setEditUpi] = useState<UserUpiIdRow | null>(null);
    const [deleteUpi, setDeleteUpi] = useState<UserUpiIdRow | null>(null);

    const [bankOtpSending, setBankOtpSending] = useState(false);
    const [bankEditOtpSending, setBankEditOtpSending] = useState(false);
    const [usdtOtpSending, setUsdtOtpSending] = useState(false);
    const [usdtEditOtpSending, setUsdtEditOtpSending] = useState(false);
    const [upiOtpSending, setUpiOtpSending] = useState(false);
    const [upiEditOtpSending, setUpiEditOtpSending] = useState(false);

    const openEditBank = (row: BankAccountRow) => {
        setEditBank(row);
        bankEditForm.setData({
            bank_name: row.bank_name,
            account_holder: row.account_holder,
            account_number: row.account_number,
            ifsc_code: row.ifsc_code,
            otp_code: '',
        });
        setEditBankOpen(true);
    };

    const openEditUsdt = (row: UsdtWalletRow) => {
        setEditUsdt(row);
        usdtEditForm.setData({
            public_address: row.public_address,
            blockchain: row.blockchain as 'erc20' | 'trc20',
            otp_code: '',
        });
        setEditUsdtOpen(true);
    };

    const openEditUpi = (row: UserUpiIdRow) => {
        setEditUpi(row);
        upiEditForm.setData({
            upi_id: row.upi_id,
            otp_code: '',
        });
        setEditUpiOpen(true);
    };

    const bankLabel = (b: BankAccountRow) =>
        `${b.bank_name} — ${b.account_holder} — …${b.account_number.slice(-4)} (${b.ifsc_code})`;

    const usdtLabel = (w: UsdtWalletRow) => `${w.public_address.slice(0, 8)}…${w.public_address.slice(-6)} (${w.blockchain_label})`;

    const upiLabel = (u: UserUpiIdRow) => u.upi_id;

    const selectedBank = bankAccounts.find((b) => String(b.id) === withdrawForm.data.bank_account_id);
    const selectedUsdt = usdtWallets.find((w) => String(w.id) === withdrawForm.data.usdt_wallet_id);
    const selectedUpi = userUpiIds.find((u) => String(u.id) === withdrawForm.data.user_upi_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdraw funds" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Withdraw Funds</h1>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        Current Balance: <span className="text-foreground font-medium tabular-nums">{formatInr(balanceNum)}</span>
                        <br />
                        Withdrawal Fee: {feePercent.toFixed(2)}% + {formatInr(feeFixedInr)}
                        <br />
                        Choose bank transfer, UPI, or USDT, then enter the amount, your payment password, and the 2FA code.
                    </p>
                </div>

                {flashMessage && (
                    <div className="bg-muted text-foreground rounded-lg border px-4 py-3 text-sm">{flashMessage}</div>
                )}

                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle>Request withdrawal</CardTitle>
                        <CardDescription>Funds are sent after review. A 6-digit code is emailed to you before submit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Withdrawal Method</Label>
                            <Select
                                value={withdrawForm.data.method}
                                onValueChange={(v) => withdrawForm.setData('method', v as 'bank' | 'usdt' | 'upi')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank">Bank Account (INR)</SelectItem>
                                    <SelectItem value="upi">UPI (INR)</SelectItem>
                                    <SelectItem value="usdt">USDT wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {withdrawForm.data.method === 'bank' && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label>Bank account</Label>
                                        <Select
                                            value={withdrawForm.data.bank_account_id}
                                            onValueChange={(v) => withdrawForm.setData('bank_account_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={bankAccounts.length ? 'Select account' : 'No accounts yet'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bankAccounts.map((b) => (
                                                    <SelectItem key={b.id} value={String(b.id)}>
                                                        {bankLabel(b)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setAddBankOpen(true)}>
                                        <Plus className="size-4" />
                                        Add new
                                    </Button>
                                </div>
                                {selectedBank && (
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        {selectedBank.bank_name} · {selectedBank.account_holder} · {selectedBank.account_number} ·{' '}
                                        {selectedBank.ifsc_code}
                                    </p>
                                )}
                            </div>
                        )}

                        {withdrawForm.data.method === 'upi' && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label>Registered UPI ID</Label>
                                        <Select
                                            value={withdrawForm.data.user_upi_id}
                                            onValueChange={(v) => withdrawForm.setData('user_upi_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={userUpiIds.length ? 'Select UPI ID' : 'No UPI IDs yet'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userUpiIds.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>
                                                        {upiLabel(u)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setAddUpiOpen(true)}>
                                        <Plus className="size-4" />
                                        Add new
                                    </Button>
                                </div>
                                {selectedUpi && (
                                    <p className="text-muted-foreground font-mono text-xs break-all">{selectedUpi.upi_id}</p>
                                )}
                            </div>
                        )}

                        {withdrawForm.data.method === 'usdt' && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Label>USDT wallet</Label>
                                        <Select
                                            value={withdrawForm.data.usdt_wallet_id}
                                            onValueChange={(v) => withdrawForm.setData('usdt_wallet_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={usdtWallets.length ? 'Select wallet' : 'No wallets yet'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usdtWallets.map((w) => (
                                                    <SelectItem key={w.id} value={String(w.id)}>
                                                        {usdtLabel(w)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setAddUsdtOpen(true)}>
                                        <Plus className="size-4" />
                                        Add new
                                    </Button>
                                </div>
                                {selectedUsdt && (
                                    <p className="text-muted-foreground font-mono text-xs break-all">
                                        {selectedUsdt.public_address} · {selectedUsdt.blockchain_label}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount to Withdraw (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={withdrawForm.data.amount}
                                onChange={(e) => withdrawForm.setData('amount', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={withdrawForm.errors.amount} />
                        </div>

                        <div className="bg-muted/50 space-y-1 rounded-md border px-3 py-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Withdrawal Fee ({feePercent.toFixed(2)}%) + fixed</span>
                                <span className="tabular-nums">
                                    {formatInr(feeVariable)} + {formatInr(feeFixedInr)} = {formatInr(totalFee)}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4 font-medium">
                                <span>Total Amount to be Deducted (₹)</span>
                                <span className="tabular-nums">{formatInr(totalDeducted)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_password">Payment password</Label>
                            <Input
                                id="payment_password"
                                type="password"
                                autoComplete="current-password"
                                value={withdrawForm.data.payment_password}
                                onChange={(e) => withdrawForm.setData('payment_password', e.target.value)}
                            />
                            <p className="text-muted-foreground text-xs">Same as your login password.</p>
                            <InputError message={withdrawForm.errors.payment_password} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Label htmlFor="otp_code">2FA code (email OTP)</Label>
                                <Button type="button" variant="secondary" size="sm" disabled={otpSending} onClick={sendWithdrawOtp}>
                                    {otpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                    Send OTP to email
                                </Button>
                            </div>
                            <Input
                                id="otp_code"
                                inputMode="numeric"
                                maxLength={6}
                                value={withdrawForm.data.otp_code}
                                onChange={(e) => withdrawForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6-digit code"
                            />
                            <InputError message={withdrawForm.errors.otp_code} />
                        </div>

                        <Button
                            className="w-full sm:w-auto"
                            disabled={withdrawForm.processing}
                            onClick={() => withdrawForm.post(route('withdraw.store'))}
                        >
                            {withdrawForm.processing ? <Loader2 className="size-4 animate-spin" /> : null}
                            Submit withdrawal
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div id="bank-accounts">
                        <h2 className="text-lg font-semibold">Your Registered Bank Accounts</h2>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-3 overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[40rem] text-left text-sm">
                                    <thead className="bg-muted/50 border-border border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Bank Name</th>
                                            <th className="px-4 py-3 font-medium">Account Holder</th>
                                            <th className="px-4 py-3 font-medium">Account Number</th>
                                            <th className="px-4 py-3 font-medium">IFSC Code</th>
                                            <th className="px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bankAccounts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                                    No bank accounts yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            bankAccounts.map((row) => (
                                                <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                                    <td className="px-4 py-3">{row.bank_name}</td>
                                                    <td className="px-4 py-3">{row.account_holder}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{row.account_number}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{row.ifsc_code}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => openEditBank(row)}>
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteBank(row)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="user-upi-ids">
                        <h2 className="text-lg font-semibold">Your Registered UPI IDs</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Save UPI VPAs (e.g. name@paytm) for INR withdrawals via UPI. Format: handle@psp.
                        </p>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-3 overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[32rem] text-left text-sm">
                                    <thead className="bg-muted/50 border-border border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">UPI ID</th>
                                            <th className="px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userUpiIds.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-muted-foreground px-4 py-8 text-center">
                                                    No UPI IDs yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            userUpiIds.map((row) => (
                                                <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                                    <td className="px-4 py-3 font-mono text-xs">{row.upi_id}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => openEditUpi(row)}>
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteUpi(row)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="usdt-wallets">
                        <h2 className="text-lg font-semibold">Your Registered USDT Wallets</h2>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border mt-3 overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[40rem] text-left text-sm">
                                    <thead className="bg-muted/50 border-border border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Wallet public address</th>
                                            <th className="px-4 py-3 font-medium">Blockchain</th>
                                            <th className="px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usdtWallets.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-muted-foreground px-4 py-8 text-center">
                                                    No USDT wallets yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            usdtWallets.map((row) => (
                                                <tr key={row.id} className="border-border/60 hover:bg-muted/30 border-b last:border-0">
                                                    <td className="max-w-[20rem] px-4 py-3 font-mono text-xs break-all">{row.public_address}</td>
                                                    <td className="px-4 py-3">{row.blockchain_label}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => openEditUsdt(row)}>
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteUsdt(row)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add bank */}
                <Dialog open={addBankOpen} onOpenChange={setAddBankOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add bank account</DialogTitle>
                            <DialogDescription>We will email a 6-digit code to verify this action.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Bank name</Label>
                                <Input
                                    value={bankAddForm.data.bank_name}
                                    onChange={(e) => bankAddForm.setData('bank_name', e.target.value)}
                                />
                                <InputError message={bankAddForm.errors.bank_name} />
                            </div>
                            <div className="space-y-2">
                                <Label>Account holder</Label>
                                <Input
                                    value={bankAddForm.data.account_holder}
                                    onChange={(e) => bankAddForm.setData('account_holder', e.target.value)}
                                />
                                <InputError message={bankAddForm.errors.account_holder} />
                            </div>
                            <div className="space-y-2">
                                <Label>Account number</Label>
                                <Input
                                    value={bankAddForm.data.account_number}
                                    onChange={(e) => bankAddForm.setData('account_number', e.target.value)}
                                />
                                <InputError message={bankAddForm.errors.account_number} />
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC code</Label>
                                <Input
                                    value={bankAddForm.data.ifsc_code}
                                    onChange={(e) => bankAddForm.setData('ifsc_code', e.target.value)}
                                />
                                <InputError message={bankAddForm.errors.ifsc_code} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={bankOtpSending}
                                    onClick={() => {
                                        setBankOtpSending(true);
                                        router.post(
                                            route('verification.send-otp'),
                                            { purpose: 'bank_add' },
                                            { preserveScroll: true, onFinish: () => setBankOtpSending(false) },
                                        );
                                    }}
                                >
                                    {bankOtpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                    Send OTP
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label>OTP code</Label>
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={bankAddForm.data.otp_code}
                                    onChange={(e) => bankAddForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <InputError message={bankAddForm.errors.otp_code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddBankOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={bankAddForm.processing}
                                onClick={() =>
                                    bankAddForm.post(route('bank-accounts.store'), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setAddBankOpen(false);
                                            bankAddForm.reset();
                                        },
                                    })
                                }
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit bank */}
                <Dialog open={editBankOpen} onOpenChange={setEditBankOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit bank account</DialogTitle>
                            <DialogDescription>Send OTP to your email, then enter the code to save.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Bank name</Label>
                                <Input
                                    value={bankEditForm.data.bank_name}
                                    onChange={(e) => bankEditForm.setData('bank_name', e.target.value)}
                                />
                                <InputError message={bankEditForm.errors.bank_name} />
                            </div>
                            <div className="space-y-2">
                                <Label>Account holder</Label>
                                <Input
                                    value={bankEditForm.data.account_holder}
                                    onChange={(e) => bankEditForm.setData('account_holder', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Account number</Label>
                                <Input
                                    value={bankEditForm.data.account_number}
                                    onChange={(e) => bankEditForm.setData('account_number', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC code</Label>
                                <Input
                                    value={bankEditForm.data.ifsc_code}
                                    onChange={(e) => bankEditForm.setData('ifsc_code', e.target.value)}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={bankEditOtpSending || !editBank}
                                onClick={() => {
                                    if (!editBank) {
                                        return;
                                    }
                                    setBankEditOtpSending(true);
                                    router.post(
                                        route('verification.send-otp'),
                                        { purpose: 'bank_edit', purpose_id: editBank.id },
                                        { preserveScroll: true, onFinish: () => setBankEditOtpSending(false) },
                                    );
                                }}
                            >
                                {bankEditOtpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                Send OTP
                            </Button>
                            <div className="space-y-2">
                                <Label>OTP code</Label>
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={bankEditForm.data.otp_code}
                                    onChange={(e) => bankEditForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <InputError message={bankEditForm.errors.otp_code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditBankOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={bankEditForm.processing || !editBank}
                                onClick={() => {
                                    if (!editBank) {
                                        return;
                                    }
                                    bankEditForm.patch(route('bank-accounts.update', editBank.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setEditBankOpen(false);
                                            bankEditForm.reset();
                                        },
                                    });
                                }}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add USDT */}
                <Dialog open={addUsdtOpen} onOpenChange={setAddUsdtOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add USDT wallet</DialogTitle>
                            <DialogDescription>Verify with email OTP before saving.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Public address</Label>
                                <Input
                                    value={usdtAddForm.data.public_address}
                                    onChange={(e) => usdtAddForm.setData('public_address', e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <InputError message={usdtAddForm.errors.public_address} />
                            </div>
                            <div className="space-y-2">
                                <Label>Blockchain</Label>
                                <Select
                                    value={usdtAddForm.data.blockchain}
                                    onValueChange={(v) => usdtAddForm.setData('blockchain', v as 'erc20' | 'trc20')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="erc20">ERC20</SelectItem>
                                        <SelectItem value="trc20">TRC20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={usdtOtpSending}
                                onClick={() => {
                                    setUsdtOtpSending(true);
                                    router.post(
                                        route('verification.send-otp'),
                                        { purpose: 'usdt_add' },
                                        { preserveScroll: true, onFinish: () => setUsdtOtpSending(false) },
                                    );
                                }}
                            >
                                {usdtOtpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                Send OTP
                            </Button>
                            <div className="space-y-2">
                                <Label>OTP code</Label>
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={usdtAddForm.data.otp_code}
                                    onChange={(e) => usdtAddForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <InputError message={usdtAddForm.errors.otp_code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddUsdtOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={usdtAddForm.processing}
                                onClick={() =>
                                    usdtAddForm.post(route('usdt-wallets.store'), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setAddUsdtOpen(false);
                                            usdtAddForm.reset();
                                        },
                                    })
                                }
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit USDT */}
                <Dialog open={editUsdtOpen} onOpenChange={setEditUsdtOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit USDT wallet</DialogTitle>
                            <DialogDescription>Send OTP, then confirm changes.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Public address</Label>
                                <Input
                                    value={usdtEditForm.data.public_address}
                                    onChange={(e) => usdtEditForm.setData('public_address', e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Blockchain</Label>
                                <Select
                                    value={usdtEditForm.data.blockchain}
                                    onValueChange={(v) => usdtEditForm.setData('blockchain', v as 'erc20' | 'trc20')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="erc20">ERC20</SelectItem>
                                        <SelectItem value="trc20">TRC20</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={usdtEditOtpSending || !editUsdt}
                                onClick={() => {
                                    if (!editUsdt) {
                                        return;
                                    }
                                    setUsdtEditOtpSending(true);
                                    router.post(
                                        route('verification.send-otp'),
                                        { purpose: 'usdt_edit', purpose_id: editUsdt.id },
                                        { preserveScroll: true, onFinish: () => setUsdtEditOtpSending(false) },
                                    );
                                }}
                            >
                                {usdtEditOtpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                Send OTP
                            </Button>
                            <div className="space-y-2">
                                <Label>OTP code</Label>
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={usdtEditForm.data.otp_code}
                                    onChange={(e) => usdtEditForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <InputError message={usdtEditForm.errors.otp_code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditUsdtOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={usdtEditForm.processing || !editUsdt}
                                onClick={() => {
                                    if (!editUsdt) {
                                        return;
                                    }
                                    usdtEditForm.patch(route('usdt-wallets.update', editUsdt.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setEditUsdtOpen(false);
                                            usdtEditForm.reset();
                                        },
                                    });
                                }}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add UPI */}
                <Dialog open={addUpiOpen} onOpenChange={setAddUpiOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add UPI ID</DialogTitle>
                            <DialogDescription>Enter your VPA (e.g. name@paytm). We email a 6-digit code to verify.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>UPI ID</Label>
                                <Input
                                    value={upiAddForm.data.upi_id}
                                    onChange={(e) => upiAddForm.setData('upi_id', e.target.value.trim())}
                                    placeholder="you@paytm"
                                    className="font-mono text-sm"
                                />
                                <InputError message={upiAddForm.errors.upi_id} />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={upiOtpSending}
                                onClick={() => {
                                    setUpiOtpSending(true);
                                    router.post(
                                        route('verification.send-otp'),
                                        { purpose: 'upi_add' },
                                        { preserveScroll: true, onFinish: () => setUpiOtpSending(false) },
                                    );
                                }}
                            >
                                {upiOtpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                Send OTP
                            </Button>
                            <div className="space-y-2">
                                <Label>OTP code</Label>
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={upiAddForm.data.otp_code}
                                    onChange={(e) => upiAddForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <InputError message={upiAddForm.errors.otp_code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddUpiOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={upiAddForm.processing}
                                onClick={() =>
                                    upiAddForm.post(route('user-upi-ids.store'), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setAddUpiOpen(false);
                                            upiAddForm.reset();
                                        },
                                    })
                                }
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit UPI */}
                <Dialog open={editUpiOpen} onOpenChange={setEditUpiOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit UPI ID</DialogTitle>
                            <DialogDescription>Send OTP to your email, then enter the code to save.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>UPI ID</Label>
                                <Input
                                    value={upiEditForm.data.upi_id}
                                    onChange={(e) => upiEditForm.setData('upi_id', e.target.value.trim())}
                                    className="font-mono text-sm"
                                />
                                <InputError message={upiEditForm.errors.upi_id} />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={upiEditOtpSending || !editUpi}
                                onClick={() => {
                                    if (!editUpi) {
                                        return;
                                    }
                                    setUpiEditOtpSending(true);
                                    router.post(
                                        route('verification.send-otp'),
                                        { purpose: 'upi_edit', purpose_id: editUpi.id },
                                        { preserveScroll: true, onFinish: () => setUpiEditOtpSending(false) },
                                    );
                                }}
                            >
                                {upiEditOtpSending ? <Loader2 className="size-4 animate-spin" /> : null}
                                Send OTP
                            </Button>
                            <div className="space-y-2">
                                <Label>OTP code</Label>
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={upiEditForm.data.otp_code}
                                    onChange={(e) => upiEditForm.setData('otp_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <InputError message={upiEditForm.errors.otp_code} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditUpiOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={upiEditForm.processing || !editUpi}
                                onClick={() => {
                                    if (!editUpi) {
                                        return;
                                    }
                                    upiEditForm.patch(route('user-upi-ids.update', editUpi.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setEditUpiOpen(false);
                                            upiEditForm.reset();
                                        },
                                    });
                                }}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete bank */}
                <Dialog
                    open={!!deleteBank}
                    onOpenChange={(o) => {
                        if (!o) {
                            setDeleteBank(null);
                            bankDeleteForm.reset();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove bank account</DialogTitle>
                            <DialogDescription>Enter your password to confirm.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={bankDeleteForm.data.password}
                                onChange={(e) => bankDeleteForm.setData('password', e.target.value)}
                            />
                            <InputError message={bankDeleteForm.errors.password} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteBank(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={bankDeleteForm.processing || !deleteBank}
                                onClick={() => {
                                    if (!deleteBank) {
                                        return;
                                    }
                                    bankDeleteForm.delete(route('bank-accounts.destroy', deleteBank.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setDeleteBank(null);
                                            bankDeleteForm.reset();
                                        },
                                    });
                                }}
                            >
                                Remove
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete USDT */}
                <Dialog
                    open={!!deleteUsdt}
                    onOpenChange={(o) => {
                        if (!o) {
                            setDeleteUsdt(null);
                            usdtDeleteForm.reset();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove USDT wallet</DialogTitle>
                            <DialogDescription>Enter your password to confirm.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={usdtDeleteForm.data.password}
                                onChange={(e) => usdtDeleteForm.setData('password', e.target.value)}
                            />
                            <InputError message={usdtDeleteForm.errors.password} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteUsdt(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={usdtDeleteForm.processing || !deleteUsdt}
                                onClick={() => {
                                    if (!deleteUsdt) {
                                        return;
                                    }
                                    usdtDeleteForm.delete(route('usdt-wallets.destroy', deleteUsdt.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setDeleteUsdt(null);
                                            usdtDeleteForm.reset();
                                        },
                                    });
                                }}
                            >
                                Remove
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete UPI */}
                <Dialog
                    open={!!deleteUpi}
                    onOpenChange={(o) => {
                        if (!o) {
                            setDeleteUpi(null);
                            upiDeleteForm.reset();
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove UPI ID</DialogTitle>
                            <DialogDescription>Enter your password to confirm.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={upiDeleteForm.data.password}
                                onChange={(e) => upiDeleteForm.setData('password', e.target.value)}
                            />
                            <InputError message={upiDeleteForm.errors.password} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteUpi(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={upiDeleteForm.processing || !deleteUpi}
                                onClick={() => {
                                    if (!deleteUpi) {
                                        return;
                                    }
                                    upiDeleteForm.delete(route('user-upi-ids.destroy', deleteUpi.id), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setDeleteUpi(null);
                                            upiDeleteForm.reset();
                                        },
                                    });
                                }}
                            >
                                Remove
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
