<?php

namespace App\Support\NowPayments;

/**
 * Verifies X-NOWPAYMENTS-SIG per NOWPayments IPN docs (HMAC-SHA512 over JSON with keys sorted recursively).
 *
 * @see https://nowpayments.zendesk.com/hc/en-us/articles/21395546303389-IPN-and-how-to-setup
 */
final class NowPaymentsIpnVerifier
{
    public static function verify(string $rawJson, ?string $signature, string $secret): bool
    {
        if ($signature === null || $signature === '' || $secret === '') {
            return false;
        }

        $data = json_decode($rawJson, true);
        if (! is_array($data)) {
            return false;
        }

        self::recursiveKsort($data);
        $payload = json_encode($data, JSON_UNESCAPED_SLASHES);
        if ($payload === false) {
            return false;
        }

        $expected = hash_hmac('sha512', $payload, $secret);

        return hash_equals($expected, $signature);
    }

    private static function recursiveKsort(array &$array): void
    {
        ksort($array);
        foreach ($array as &$value) {
            if (is_array($value)) {
                self::recursiveKsort($value);
            }
        }
    }
}
