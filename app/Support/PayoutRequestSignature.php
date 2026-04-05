<?php

namespace App\Support;

class PayoutRequestSignature
{
    public static function compute(array $payload, string $payoutApiKey): string
    {
        return md5(self::buildSignString($payload, $payoutApiKey));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function buildSignString(array $payload, string $payoutApiKey): string
    {
        $paymentType = strtolower(trim((string) ($payload['payment_type'] ?? '')));

        $params = [
            'merchant_id' => trim((string) ($payload['merchant_id'] ?? '')),
            'payment_type' => $paymentType,
            'amount' => number_format((float) ($payload['amount'] ?? 0), 2, '.', ''),
            'transaction_id' => trim((string) ($payload['transaction_id'] ?? '')),
            'callback_url' => trim((string) ($payload['callback_url'] ?? '')),
        ];

        if ($paymentType === 'inr') {
            $params['account_number'] = trim((string) ($payload['account_number'] ?? ''));
            $params['ifsc'] = trim((string) ($payload['ifsc'] ?? ''));
            $params['name'] = trim((string) ($payload['name'] ?? ''));
            $params['bank_name'] = trim((string) ($payload['bank_name'] ?? ''));
        } elseif ($paymentType === 'usdt') {
            $params['usdt_wallet_address'] = trim((string) ($payload['usdt_wallet_address'] ?? ''));
        } elseif ($paymentType === 'upi') {
            $params['upi_id'] = trim((string) ($payload['upi_id'] ?? ''));
        }

        $params = array_filter($params, static fn (string $v): bool => $v !== '');

        ksort($params);

        $signStr = '';
        foreach ($params as $k => $v) {
            $signStr .= $k.'='.$v.'&';
        }

        return $signStr.'key='.$payoutApiKey;
    }

    public static function verify(array $payload, string $payoutApiKey, string $providedSignature): bool
    {
        $expected = self::compute($payload, $payoutApiKey);

        return hash_equals(strtolower($expected), strtolower($providedSignature));
    }
}
