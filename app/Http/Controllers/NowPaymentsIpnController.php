<?php

namespace App\Http\Controllers;

use App\Enums\CollectionOrderStatus;
use App\Enums\CollectionPaymentType;
use App\Models\CollectionOrder;
use App\Support\NowPayments\NowPaymentsIpnVerifier;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class NowPaymentsIpnController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $raw = $request->getContent();
        $secret = (string) config('nowpayments.ipn_secret');
        $sig = $request->header('x-nowpayments-sig');

        if (! NowPaymentsIpnVerifier::verify($raw, $sig, $secret)) {
            Log::warning('NOWPayments IPN rejected: invalid signature');

            return response('invalid signature', 401);
        }

        /** @var array<string, mixed>|null $data */
        $data = json_decode($raw, true);
        if (! is_array($data)) {
            return response('bad payload', 400);
        }

        $orderId = $data['order_id'] ?? null;
        if (! is_string($orderId) || $orderId === '') {
            return response('ok', 200);
        }

        $order = CollectionOrder::query()->where('order_no', $orderId)->first();
        if ($order === null) {
            Log::notice('NOWPayments IPN: order not found', ['order_id' => $orderId]);

            return response('ok', 200);
        }

        if ($order->payment_type !== CollectionPaymentType::Usdt) {
            return response('ok', 200);
        }

        $npPaymentId = $data['payment_id'] ?? null;
        if ($order->nowpayments_payment_id !== null && $npPaymentId !== null) {
            if ((string) $npPaymentId !== (string) $order->nowpayments_payment_id) {
                Log::warning('NOWPayments IPN payment_id mismatch', [
                    'order_no' => $order->order_no,
                    'expected' => $order->nowpayments_payment_id,
                    'got' => $npPaymentId,
                ]);

                return response('ok', 200);
            }
        }

        $paymentStatus = isset($data['payment_status']) && is_string($data['payment_status'])
            ? strtolower($data['payment_status'])
            : '';

        $newStatus = match ($paymentStatus) {
            'finished' => CollectionOrderStatus::Success,
            'failed', 'expired', 'refunded' => CollectionOrderStatus::Failed,
            default => null,
        };

        if ($newStatus !== null && $order->status !== $newStatus) {
            $order->update(['status' => $newStatus]);
        }

        return response('ok', 200);
    }
}
