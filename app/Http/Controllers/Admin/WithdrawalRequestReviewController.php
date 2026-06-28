<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FundDetailType;
use App\Http\Controllers\Controller;
use App\Models\FundDetail;
use App\Models\User;
use App\Models\WalletBalance;
use App\Models\WithdrawalRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WithdrawalRequestReviewController extends Controller
{
    public function accept(Request $request, WithdrawalRequest $withdrawalRequest): RedirectResponse
    {
        return $this->decide($request, $withdrawalRequest, 'approved');
    }

    public function reject(Request $request, WithdrawalRequest $withdrawalRequest): RedirectResponse
    {
        return $this->decide($request, $withdrawalRequest, 'rejected');
    }

    private function decide(Request $request, WithdrawalRequest $withdrawalRequest, string $newStatus): RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null || ! $user->isAdmin()) {
            abort(403);
        }

        if ($withdrawalRequest->merchant_id === null) {
            return redirect()->route('withdrawal-requests.index')->withErrors([
                'review' => 'Only merchant withdrawal requests can be reviewed here.',
            ]);
        }

        if ($withdrawalRequest->status !== 'pending') {
            return redirect()->route('withdrawal-requests.index')->withErrors([
                'review' => 'Only pending withdrawal requests can be approved or rejected.',
            ]);
        }

        if ($newStatus === 'approved') {
            $deducted = (float) $withdrawalRequest->total_deducted;

            try {
                DB::transaction(function () use ($withdrawalRequest, $deducted): void {
                    $locked = WithdrawalRequest::query()
                        ->whereKey($withdrawalRequest->id)
                        ->lockForUpdate()
                        ->first();

                    if ($locked === null || $locked->status !== 'pending') {
                        throw new \RuntimeException('Withdrawal request is no longer pending.');
                    }

                    $wallet = WalletBalance::query()
                        ->where('merchant_id', $locked->merchant_id)
                        ->lockForUpdate()
                        ->first();

                    if ($wallet === null) {
                        throw new \RuntimeException('Merchant wallet not found.');
                    }

                    $balanceBefore = (float) $wallet->balance;

                    if ($deducted > $balanceBefore) {
                        throw new \RuntimeException('Insufficient merchant balance to approve this withdrawal.');
                    }

                    $balanceAfter = round($balanceBefore - $deducted, 2);

                    $wallet->update([
                        'balance' => number_format($balanceAfter, 2, '.', ''),
                    ]);

                    $totalFee = round((float) $locked->fee_amount + (float) $locked->fee_fixed, 2);

                    FundDetail::query()->create([
                        'merchant_id' => $locked->merchant_id,
                        'type' => FundDetailType::Debit,
                        'transaction_id' => 'WR-'.$locked->id,
                        'amount' => $locked->amount,
                        'fee' => number_format($totalFee, 2, '.', ''),
                        'final_amount' => $locked->total_deducted,
                        'balance_before' => number_format($balanceBefore, 2, '.', ''),
                        'balance_after' => number_format($balanceAfter, 2, '.', ''),
                        'transaction_date' => now(),
                    ]);

                    $locked->update(['status' => 'approved']);

                    Log::info('Withdrawal request approved', [
                        'withdrawal_request_id' => $locked->id,
                        'merchant_id' => $locked->merchant_id,
                        'total_deducted' => $deducted,
                        'balance_after' => $balanceAfter,
                    ]);
                });
            } catch (\RuntimeException $e) {
                return redirect()->route('withdrawal-requests.index')->withErrors([
                    'review' => $e->getMessage(),
                ]);
            }
        } else {
            $withdrawalRequest->update(['status' => 'rejected']);

            Log::info('Withdrawal request rejected', [
                'withdrawal_request_id' => $withdrawalRequest->id,
                'merchant_id' => $withdrawalRequest->merchant_id,
            ]);
        }

        $flash = $newStatus === 'approved' ? 'withdrawal-request-approved' : 'withdrawal-request-rejected';

        return redirect()->route('withdrawal-requests.index')->with('status', $flash);
    }
}
