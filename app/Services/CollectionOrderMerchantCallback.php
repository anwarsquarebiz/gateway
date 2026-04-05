<?php

namespace App\Services;

use App\Models\CollectionOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CollectionOrderMerchantCallback
{
    /**
     * POST JSON to the merchant callback_url and update callback_status on the order.
     *
     * @param  'success'|'failed'  $status
     */
    public function dispatch(CollectionOrder $order, string $status): void
    {
        $url = $order->callback_url;
        if ($url === null || $url === '') {
            $order->update(['callback_status' => 'skipped_no_url']);

            return;
        }

        $payload = [
            'orderNo' => $order->order_no,
            'merchantOrder' => $order->merchant_order_no,
            'status' => $status,
            'amount' => (float) $order->amount,
        ];

        try {
            $response = Http::timeout(20)
                ->connectTimeout(10)
                ->asJson()
                ->post($url, $payload);

            $order->update([
                'callback_status' => $response->successful() ? 'delivered' : 'failed',
            ]);

            if (! $response->successful()) {
                Log::warning('Collection order merchant callback non-success', [
                    'order_no' => $order->order_no,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            $order->update(['callback_status' => 'failed']);
            Log::warning('Collection order merchant callback exception', [
                'order_no' => $order->order_no,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
