<?php

namespace App\Support\NowPayments;

use App\Models\CollectionOrder;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NowPaymentsClient
{
    public function isConfigured(): bool
    {
        $key = config('nowpayments.api_key');

        return is_string($key) && $key !== '';
    }

    /**
     * Create a NOWPayments payment for a USDT collection order.
     * Populates pay_address; caller persists fields on the order.
     *
     * @return array{
     *     payment_id: string|int,
     *     pay_address: string,
     *     pay_amount: string|float|int|null,
     *     pay_currency: string|null,
     *     payment_status: string|null,
     * }
     *
     * @throws NowPaymentsException
     */
    public function createPaymentForCollectionOrder(CollectionOrder $order): array
    {
        if (! $this->isConfigured()) {
            throw new NowPaymentsException('NOWPayments API key is not configured.');
        }

        $baseUrl = config('nowpayments.base_url');
        $amount = (float) $order->amount;

        $payload = [
            'price_amount' => $amount,
            'price_currency' => config('nowpayments.price_currency'),
            'pay_currency' => config('nowpayments.pay_currency'),
            'pay_amount' => $amount,
            'order_id' => $order->order_no,
            'order_description' => 'Collection order '.$order->merchant_order_no,
            'ipn_callback_url' => route('nowpayments.ipn'),
        ];

        if (config('nowpayments.fixed_rate')) {
            $payload['fixed_rate'] = true;
        }

        $pending = Http::timeout(45)
            ->connectTimeout(15)
            ->withHeaders([
                'x-api-key' => config('nowpayments.api_key'),
            ])
            ->acceptJson()
            ->asJson();

        if (! config('nowpayments.verify_ssl')) {
            $pending = $pending->withoutVerifying();
        }

        /** @var Response $response */
        $response = $pending->post($baseUrl.'/payment', $payload);

        if (! $response->successful()) {
            Log::warning('NOWPayments create payment failed', [
                'order_no' => $order->order_no,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new NowPaymentsException(
                'NOWPayments could not create a payment.',
                $response->json(),
                $response->status()
            );
        }

        /** @var array<string, mixed> $json */
        $json = $response->json();

        $payAddress = $json['pay_address'] ?? null;
        if (! is_string($payAddress) || $payAddress === '') {
            throw new NowPaymentsException('NOWPayments response missing pay_address.', $json);
        }

        $paymentId = $json['payment_id'] ?? null;
        if ($paymentId === null || $paymentId === '') {
            throw new NowPaymentsException('NOWPayments response missing payment_id.', $json);
        }

        return [
            'payment_id' => is_scalar($paymentId) ? (string) $paymentId : '',
            'pay_address' => $payAddress,
            'pay_amount' => $json['pay_amount'] ?? null,
            'pay_currency' => isset($json['pay_currency']) && is_string($json['pay_currency']) ? $json['pay_currency'] : null,
            'payment_status' => isset($json['payment_status']) && is_string($json['payment_status']) ? $json['payment_status'] : null,
        ];
    }
}
