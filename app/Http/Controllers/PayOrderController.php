<?php

namespace App\Http\Controllers;

use App\Models\CollectionOrder;
use App\Support\UpiIntentUrlBuilder;
use Illuminate\View\View;

class PayOrderController extends Controller
{
    /**
     * Public payment landing page for a collection order.
     */
    public function __invoke(string $order_no): View
    {
        $order = CollectionOrder::query()->where('order_no', $order_no)->firstOrFail();

        $upiIntents = UpiIntentUrlBuilder::forOrder($order);
        $payExpiresAt = $order->created_at?->copy()->addMinutes(15);
        $usdtPayExpiresAt = $order->created_at?->copy()->addHour();

        $usdtQrImageUrl = null;
        if ($order->payment_type?->value === 'usdt' && $order->receiving_usdt_address) {
            $usdtQrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=M&data='.rawurlencode($order->receiving_usdt_address);
        }

        return view('pay-order', [
            'order' => $order,
            'upiIntents' => $upiIntents,
            'payExpiresAt' => $payExpiresAt,
            'usdtPayExpiresAt' => $usdtPayExpiresAt,
            'usdtQrImageUrl' => $usdtQrImageUrl,
        ]);
    }
}
