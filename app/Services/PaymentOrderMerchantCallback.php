<?php

namespace App\Services;

use App\Models\PaymentOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentOrderMerchantCallback
{
    /**
     * POST JSON to the merchant callback_url (payout status).
     *
     * @param  'SUCCESS'|'FAILED'  $status
     */
    public function dispatch(PaymentOrder $order, string $status): void
    {
        $url = $order->callback_url;
        if ($url === null || $url === '') {
            $order->update(['callback_status' => 'skipped_no_url']);

            return;
        }

        $payoutAmount = $order->final_amount;
        if ($payoutAmount === null && $order->fee !== null) {
            $payoutAmount = number_format(round((float) $order->amount - (float) $order->fee, 2), 2, '.', '');
        }
        if ($payoutAmount === null) {
            $payoutAmount = $order->total_amount ?? $order->amount;
        }

        $payload = [
            'merchant_id' => $order->merchant_id,
            'transaction_id' => $order->transaction_id,
            'amount' => number_format((float) $payoutAmount, 2, '.', ''),
            'status' => $status,
            'timestamp' => now()->format('Y-m-d H:i:s'),
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
                Log::warning('Payment order merchant callback non-success', [
                    'transaction_id' => $order->transaction_id,
                    'http_status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            $order->update(['callback_status' => 'failed']);
            Log::warning('Payment order merchant callback exception', [
                'transaction_id' => $order->transaction_id,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
