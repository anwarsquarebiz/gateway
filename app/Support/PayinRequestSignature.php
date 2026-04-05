<?php

namespace App\Support;

class PayinRequestSignature
{
    /**
     * Build MD5 signature for payin create request (merchant_id, amount, merchant_order_no, callback_url + secret key).
     */
    public static function compute(array $payload, string $apiKey): string
    {
        $signString = self::buildSignString($payload, $apiKey);

        return md5($signString);
    }

    /**
     * @param  array{merchant_id?: mixed, amount?: mixed, merchant_order_no?: mixed, callback_url?: mixed, payment_type?: mixed}  $payload
     */
    public static function buildSignString(array $payload, string $apiKey): string
    {
        $params = [
            'merchant_id' => trim((string) ($payload['merchant_id'] ?? '')),
            'amount' => number_format((float) ($payload['amount'] ?? 0), 2, '.', ''),
            'merchant_order_no' => trim((string) ($payload['merchant_order_no'] ?? '')),
            'callback_url' => trim((string) ($payload['callback_url'] ?? '')),
            'payment_type' => trim((string) ($payload['payment_type'] ?? '')),
        ];

        $params = array_filter($params, static fn (string $v): bool => $v !== '');

        ksort($params);

        $signStr = '';
        foreach ($params as $k => $v) {
            $signStr .= $k.'='.$v.'&';
        }

        return $signStr.'key='.$apiKey;
    }

    public static function verify(array $payload, string $apiKey, string $providedSignature): bool
    {
        $expected = self::compute($payload, $apiKey);

        return hash_equals(strtolower($expected), strtolower($providedSignature));
    }
}
