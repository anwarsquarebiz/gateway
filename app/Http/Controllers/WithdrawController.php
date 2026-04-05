<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use App\Models\UsdtWallet;
use App\Models\User;
use App\Models\WalletBalance;
use App\Models\WithdrawalRequest;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otp,
    ) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $feePercent = (float) config('withdraw.fee_percent');
        $feeFixed = (float) config('withdraw.fee_fixed_inr');

        $balance = $this->resolveBalance($user);

        $bankAccounts = $user->bankAccounts()
            ->orderBy('bank_name')
            ->get()
            ->map(fn (BankAccount $b) => [
                'id' => $b->id,
                'bank_name' => $b->bank_name,
                'account_holder' => $b->account_holder,
                'account_number' => $b->account_number,
                'ifsc_code' => $b->ifsc_code,
            ]);

        $usdtWallets = $user->usdtWallets()
            ->orderBy('id')
            ->get()
            ->map(fn (UsdtWallet $w) => [
                'id' => $w->id,
                'public_address' => $w->public_address,
                'blockchain' => $w->blockchain->value,
                'blockchain_label' => $w->blockchain->label(),
            ]);

        return Inertia::render('withdraw', [
            'currentBalance' => $balance,
            'feePercent' => $feePercent,
            'feeFixedInr' => $feeFixed,
            'bankAccounts' => $bankAccounts,
            'usdtWallets' => $usdtWallets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $feePercent = (float) config('withdraw.fee_percent');
        $feeFixed = (float) config('withdraw.fee_fixed_inr');

        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'method' => ['required', 'string', Rule::in(['bank', 'usdt'])],
            'bank_account_id' => [
                'required_if:method,bank',
                'exclude_unless:method,bank',
                'integer',
                Rule::exists('bank_accounts', 'id')->where('user_id', $user->id),
            ],
            'usdt_wallet_id' => [
                'required_if:method,usdt',
                'exclude_unless:method,usdt',
                'integer',
                Rule::exists('usdt_wallets', 'id')->where('user_id', $user->id),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_password' => ['required', 'current_password'],
            'otp_code' => ['required', 'digits:6'],
        ]);

        if (! $this->otp->verify($user, 'withdraw', $validated['otp_code'], null)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.'])->withInput();
        }

        $amount = round((float) $validated['amount'], 2);
        $feeAmount = round($amount * $feePercent / 100, 2);
        $totalDeducted = round($amount + $feeAmount + $feeFixed, 2);

        $balanceStr = $this->resolveBalance($user);
        $balance = (float) $balanceStr;
        if ($totalDeducted > $balance) {
            return back()->withErrors(['amount' => 'Total deduction exceeds your current balance.'])->withInput();
        }

        WithdrawalRequest::query()->create([
            'user_id' => $user->id,
            'merchant_id' => $user->merchant_id,
            'method' => $validated['method'],
            'bank_account_id' => $validated['method'] === 'bank' ? (int) $validated['bank_account_id'] : null,
            'usdt_wallet_id' => $validated['method'] === 'usdt' ? (int) $validated['usdt_wallet_id'] : null,
            'amount' => $amount,
            'fee_percent' => $feePercent,
            'fee_fixed' => $feeFixed,
            'fee_amount' => $feeAmount,
            'total_deducted' => $totalDeducted,
            'status' => 'pending',
        ]);

        return back()->with('status', 'withdrawal-submitted');
    }

    private function resolveBalance(User $user): string
    {
        if ($user->merchant_id !== null) {
            $row = WalletBalance::query()->where('merchant_id', $user->merchant_id)->first();

            return $row !== null ? (string) $row->balance : '0.00';
        }

        if ($user->isAdmin()) {
            $sum = WalletBalance::query()->sum('balance');

            return number_format((float) $sum, 2, '.', '');
        }

        return '0.00';
    }
}
