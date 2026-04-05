<?php

use App\Support\PayoutRequestSignature;

test('inr payout signature matches canonical string', function () {
    $payoutKey = 'pk_payout_test_key';
    $payload = [
        'merchant_id' => '100555001',
        'payment_type' => 'inr',
        'amount' => '150',
        'transaction_id' => 'WD_1761272941',
        'callback_url' => 'https://merchant.example.com/payout-callback',
        'account_number' => '1234567890',
        'ifsc' => 'HDFC0001234',
        'name' => 'Rahul Kumar',
        'bank_name' => 'HDFC Bank',
    ];

    $signStr = PayoutRequestSignature::buildSignString($payload, $payoutKey);

    expect($signStr)->toBe(
        'account_number=1234567890&amount=150.00&bank_name=HDFC Bank&callback_url=https://merchant.example.com/payout-callback&ifsc=HDFC0001234&merchant_id=100555001&name=Rahul Kumar&payment_type=inr&transaction_id=WD_1761272941&key=pk_payout_test_key'
    );

    $signature = PayoutRequestSignature::compute($payload, $payoutKey);

    expect(PayoutRequestSignature::verify($payload, $payoutKey, $signature))->toBeTrue();
    expect(PayoutRequestSignature::verify($payload, $payoutKey, 'deadbeefdeadbeefdeadbeefdeadbeef'))->toBeFalse();
});

test('upi payout signature includes upi_id', function () {
    $payoutKey = 'pk_upi';
    $payload = [
        'merchant_id' => '100555001',
        'payment_type' => 'upi',
        'amount' => 99.99,
        'transaction_id' => 'WD_UPI_1',
        'callback_url' => 'https://example.com/cb',
        'upi_id' => 'user@paytm',
    ];

    expect(PayoutRequestSignature::verify($payload, $payoutKey, PayoutRequestSignature::compute($payload, $payoutKey)))->toBeTrue();
});

test('usdt payout signature includes wallet only', function () {
    $payoutKey = 'pk_usdt';
    $payload = [
        'merchant_id' => '100555001',
        'payment_type' => 'usdt',
        'amount' => 200.5,
        'transaction_id' => 'WD_USDT_1',
        'callback_url' => 'https://example.com/cb',
        'usdt_wallet_address' => 'TAbCdEfGhIjKlMnOpQrStUvWxYz0123456789',
    ];

    $signStr = PayoutRequestSignature::buildSignString($payload, $payoutKey);

    expect($signStr)->toContain('usdt_wallet_address=TAbCdEfGhIjKlMnOpQrStUvWxYz0123456789');
    expect($signStr)->toContain('payment_type=usdt');
    expect(PayoutRequestSignature::verify($payload, $payoutKey, PayoutRequestSignature::compute($payload, $payoutKey)))->toBeTrue();
});
