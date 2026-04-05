<?php

namespace App\Support;

use App\Models\CollectionOrder;

final class UpiIntentUrlBuilder
{
    /**
     * @return array{upi_pay: string, paytm: string, phonepe: string, qr_image_url: string}|null
     */
    public static function forOrder(CollectionOrder $order): ?array
    {
        if ($order->payment_type?->value !== 'inr' || ! $order->receiving_upi_id) {
            return null;
        }

        $pa = $order->receiving_upi_id;
        $pn = (string) config('app.name', 'Payment');
        $am = (string) $order->amount;
        $tn = 'Order '.$order->order_no;

        $query = http_build_query([
            'pa' => $pa,
            'pn' => $pn,
            'am' => $am,
            'cu' => 'INR',
            'tn' => $tn,
        ], '', '&', PHP_QUERY_RFC3986);

        $upiPay = 'upi://pay?'.$query;

        return [
            'upi_pay' => $upiPay,
            'paytm' => 'paytmmp://pay?'.$query,
            'phonepe' => 'phonepe://pay?'.$query,
            'qr_image_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=M&data='.rawurlencode($upiPay),
        ];
    }
}
