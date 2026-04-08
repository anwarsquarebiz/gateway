<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CollectionOrderStatus;
use App\Http\Controllers\Controller;
use App\Models\BrokerCommission;
use App\Models\CollectionOrder;
use App\Models\User;
use App\Models\WalletBalance;
use App\Services\CollectionOrderMerchantCallback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class CollectionOrderReviewController extends Controller
{
    public function accept(CollectionOrder $collectionOrder): RedirectResponse
    {
        return $this->decide($collectionOrder, CollectionOrderStatus::Success);
    }

    public function reject(CollectionOrder $collectionOrder): RedirectResponse
    {
        return $this->decide($collectionOrder, CollectionOrderStatus::Failed);
    }

    private function decide(CollectionOrder $order, CollectionOrderStatus $newStatus): RedirectResponse
    {
        if (! in_array($order->status, [CollectionOrderStatus::Created, CollectionOrderStatus::Submitted], true)) {
            return redirect()->route('collection-orders')->withErrors([
                'review' => 'Only open orders (created or submitted) can be accepted or rejected.',
            ]);
        }

        DB::transaction(function () use ($order, $newStatus): void {
            $order->update(['status' => $newStatus]);

            if ($newStatus !== CollectionOrderStatus::Success) {
                return;
            }

            // Find merchant by business merchant_id from the collection order.
            $merchant = User::query()
                ->where('merchant_id', $order->merchant_id)
                ->first();

            if (! $merchant || $merchant->broker_id === null) {
                return;
            }

            $broker = User::query()->find($merchant->broker_id);
            if (! $broker) {
                return;
            }

            $amount = (float) $order->amount;
            $percentage = (float) $broker->payin_fee_percent;
            $commissionAmount = round(($amount * $percentage) / 100, 2);

            if ($commissionAmount <= 0) {
                return;
            }

            BrokerCommission::query()->create([
                'user_id' => $broker->id,
                'amount' => number_format($amount, 2, '.', ''),
                'percentage' => number_format($percentage, 2, '.', ''),
                'commission_amount' => number_format($commissionAmount, 2, '.', ''),
            ]);

            $wallet = WalletBalance::query()->firstOrCreate(
                ['merchant_id' => $broker->id],
                ['balance' => '0.00']
            );

            $newBalance = (float) $wallet->balance + $commissionAmount;
            $wallet->update([
                'balance' => number_format($newBalance, 2, '.', ''),
            ]);
        });

        $callbackStatus = $newStatus === CollectionOrderStatus::Success ? 'success' : 'failed';
        app(CollectionOrderMerchantCallback::class)->dispatch($order->fresh(), $callbackStatus);

        $flash = $newStatus === CollectionOrderStatus::Success ? 'collection-order-accepted' : 'collection-order-rejected';        

        return redirect()->route('collection-orders')->with('status', $flash);
    }
}
