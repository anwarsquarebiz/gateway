<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API key (Dashboard → API keys)
    |--------------------------------------------------------------------------
    */
    'api_key' => env('NOWPAYMENTS_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | IPN secret (Dashboard → Payment settings → IPN)
    |--------------------------------------------------------------------------
    */
    'ipn_secret' => env('NOWPAYMENTS_IPN_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | API base URL (production or sandbox)
    |--------------------------------------------------------------------------
    | Sandbox: https://api-sandbox.nowpayments.io/v1
    */
    'base_url' => rtrim((string) env('NOWPAYMENTS_BASE_URL', 'https://api.nowpayments.io/v1'), '/'),

    /*
    |--------------------------------------------------------------------------
    | Crypto currency ticker for checkout (e.g. usdttrc20, usdterc20)
    |--------------------------------------------------------------------------
    */
    'pay_currency' => env('NOWPAYMENTS_PAY_CURRENCY', 'usdttrc20'),

    /*
    |--------------------------------------------------------------------------
    | Fiat currency used for price_amount (NOWPayments requirement)
    |--------------------------------------------------------------------------
    | For stable USDT orders we send price_amount equal to your order amount.
    */
    'price_currency' => env('NOWPAYMENTS_PRICE_CURRENCY', 'usd'),

    /*
    |--------------------------------------------------------------------------
    | Fixed-rate payment (recommended for stablecoin amounts)
    |--------------------------------------------------------------------------
    */
    'fixed_rate' => filter_var(env('NOWPAYMENTS_FIXED_RATE', true), FILTER_VALIDATE_BOOL),

    /*
    |--------------------------------------------------------------------------
    | Verify TLS certificates (cURL)
    |--------------------------------------------------------------------------
    | Default false so local Windows/PHP setups without an up-to-date CA bundle
    | can reach the API (fixes cURL error 60). Set NOWPAYMENTS_VERIFY_SSL=true
    | in production once php.ini curl.cainfo / openssl.cafile is configured.
    */
    'verify_ssl' => filter_var(env('NOWPAYMENTS_VERIFY_SSL', false), FILTER_VALIDATE_BOOL),

];
