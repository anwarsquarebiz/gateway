<?php

use App\Support\PayinRequestSignature;

test('signature matches PHP example flow', function () {
    $apiKey = 'sk_live_xxx';
    $payload = [
        'merchant_id' => '100555001',
        'amount' => '1000.00',
        'merchant_order_no' => 'ORD20250201',
        'callback_url' => 'https://site.com/callback',
        'payment_type' => 'inr',
    ];

    $signStr = PayinRequestSignature::buildSignString($payload, $apiKey);

    expect($signStr)->toBe(
        'amount=1000.00&callback_url=https://site.com/callback&merchant_id=100555001&merchant_order_no=ORD20250201&payment_type=inr&key=sk_live_xxx'
    );

    $signature = PayinRequestSignature::compute($payload, $apiKey);

    expect(PayinRequestSignature::verify($payload, $apiKey, $signature))->toBeTrue();
    expect(PayinRequestSignature::verify($payload, $apiKey, 'deadbeefdeadbeefdeadbeefdeadbeef'))->toBeFalse();
});
