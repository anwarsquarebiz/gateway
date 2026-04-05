<?php

namespace App\Observers;

use App\Enums\PaymentOrderStatus;
use App\Models\PaymentOrder;
use App\Services\PaymentOrderMerchantCallback;

class PaymentOrderObserver
{
    public function updated(PaymentOrder $order): void
    {
        if (! $order->wasChanged('status')) {
            return;
        }

        if ($order->status === PaymentOrderStatus::Success) {
            app(PaymentOrderMerchantCallback::class)->dispatch($order->fresh(), 'SUCCESS');
        } elseif ($order->status === PaymentOrderStatus::Failed) {
            app(PaymentOrderMerchantCallback::class)->dispatch($order->fresh(), 'FAILED');
        }
    }
}
