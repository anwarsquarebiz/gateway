<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WalletBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the application dashboard.
     */
    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $label = 'Wallet balance';
        $balance = null;
        $brokerStats = null;

        if ($user->merchant_id !== null) {
            $row = WalletBalance::query()->where('merchant_id', $user->merchant_id)->first();
            $balance = $row !== null ? (string) $row->balance : null;
        } elseif ($user->isAdmin()) {
            $label = 'Total wallet balances';
            $sum = WalletBalance::query()->sum('balance');
            $balance = $sum !== null ? number_format((float) $sum, 2, '.', '') : '0.00';
        } elseif ($user->isBroker()) {
            $label = 'Wallet balance';
            $row = WalletBalance::query()->where('merchant_id', $user->id)->first();
            $balance = $row !== null ? (string) $row->balance : '0.00';

            $brokerStats = [
                'wallet_balance' => $balance,
                'payin_fee_percent' => (string) $user->payin_fee_percent,
                'merchant_count' => User::query()
                    ->where('role', \App\Enums\UserRole::Merchant)
                    ->where('broker_id', $user->id)
                    ->count(),
            ];
        }

        $merchantCredentials = null;
        if ($user->isMerchant()) {
            $merchantCredentials = [
                'payin_api_key' => $user->payin_api_key,
                'payout_api_key' => $user->payout_api_key,
                'payin_fee_percent' => (string) $user->payin_fee_percent,
                'payout_fee_percent' => (string) $user->payout_fee_percent,
            ];
        }

        return Inertia::render('dashboard', [
            'walletBalance' => $balance,
            'walletBalanceLabel' => $label,
            'merchantCredentials' => $merchantCredentials,
            'brokerStats' => $brokerStats,
        ]);
    }
}
