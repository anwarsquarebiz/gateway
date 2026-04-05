<?php

use App\Enums\PaymentOrderStatus;
use App\Models\PaymentOrder;
use App\Models\User;
use App\Support\PayoutRequestSignature;
use Illuminate\Support\Facades\Http;

test('inr payout creates payment order and returns success payload', function () {
    $user = User::factory()->create([
        'merchant_id' => 100_555_001,
        'payout_fee_percent' => '3.50',
    ]);

    $base = [
        'merchant_id' => '100555001',
        'payment_type' => 'inr',
        'amount' => 150,
        'transaction_id' => 'WD_1761272941',
        'callback_url' => 'https://merchant.example.com/payout-callback',
        'account_number' => '1234567890',
        'ifsc' => 'HDFC0001234',
        'name' => 'Rahul Kumar',
        'bank_name' => 'HDFC Bank',
    ];
    $signature = PayoutRequestSignature::compute($base, $user->payout_api_key);

    $response = $this->postJson('/v1/payout', array_merge($base, ['signature' => $signature]));

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Withdrawal request received')
        ->assertJsonPath('data.transaction_id', 'WD_1761272941')
        ->assertJsonPath('data.amount', 150)
        ->assertJsonPath('data.fee', 5.25)
        ->assertJsonPath('data.final_amount', 144.75)
        ->assertJsonPath('data.total_amount', 144.75);

    $order = PaymentOrder::query()->where('transaction_id', 'WD_1761272941')->first();
    expect($order)->not->toBeNull();
    expect($order->merchant_id)->toBe(100_555_001);
    expect($order->status)->toBe(PaymentOrderStatus::Pending);
    expect($order->usdt_wallet_address)->toBe('');
});

test('upi payout creates payment order', function () {
    $user = User::factory()->create([
        'merchant_id' => 100_555_006,
        'payout_fee_percent' => '0',
    ]);

    $base = [
        'merchant_id' => '100555006',
        'payment_type' => 'upi',
        'amount' => 75,
        'transaction_id' => 'WD_UPI_OK',
        'callback_url' => 'https://merchant.example.com/cb',
        'upi_id' => 'beneficiary@upi',
    ];
    $signature = PayoutRequestSignature::compute($base, $user->payout_api_key);

    $this->postJson('/v1/payout', array_merge($base, ['signature' => $signature]))
        ->assertOk()
        ->assertJsonPath('data.final_amount', 75)
        ->assertJsonPath('data.total_amount', 75);

    $order = PaymentOrder::query()->where('transaction_id', 'WD_UPI_OK')->first();
    expect($order)->not->toBeNull();
    expect($order->upi_id)->toBe('beneficiary@upi');
});

test('usdt payout rejects bank fields', function () {
    $user = User::factory()->create(['merchant_id' => 100_555_002]);

    $base = [
        'merchant_id' => '100555002',
        'payment_type' => 'usdt',
        'amount' => 100,
        'transaction_id' => 'WD_USDT_X',
        'callback_url' => 'https://merchant.example.com/cb',
        'usdt_wallet_address' => 'TAbCdEfGhIjKlMnOpQrStUvWxYz0123456789',
        'account_number' => '1',
    ];
    $signature = PayoutRequestSignature::compute([
        'merchant_id' => $base['merchant_id'],
        'payment_type' => 'usdt',
        'amount' => $base['amount'],
        'transaction_id' => $base['transaction_id'],
        'callback_url' => $base['callback_url'],
        'usdt_wallet_address' => $base['usdt_wallet_address'],
    ], $user->payout_api_key);

    $this->postJson('/v1/payout', array_merge($base, ['signature' => $signature]))
        ->assertStatus(422)
        ->assertJsonPath('status', 'error');
});

test('duplicate transaction_id returns 400', function () {
    $user = User::factory()->create(['merchant_id' => 100_555_003]);

    $base = [
        'merchant_id' => '100555003',
        'payment_type' => 'inr',
        'amount' => 50,
        'transaction_id' => 'WD_DUP',
        'callback_url' => 'https://merchant.example.com/cb',
        'account_number' => '1',
        'ifsc' => 'HDFC0001234',
        'name' => 'A',
        'bank_name' => 'B',
    ];
    $sig = PayoutRequestSignature::compute($base, $user->payout_api_key);
    $this->postJson('/v1/payout', array_merge($base, ['signature' => $sig]))->assertOk();
    $this->postJson('/v1/payout', array_merge($base, ['signature' => $sig]))
        ->assertStatus(400)
        ->assertJsonPath('message', 'Transaction already exists');
});

test('invalid signature returns 400', function () {
    $user = User::factory()->create(['merchant_id' => 100_555_004]);

    $base = [
        'merchant_id' => '100555004',
        'payment_type' => 'inr',
        'amount' => 50,
        'transaction_id' => 'WD_BADSIG',
        'callback_url' => 'https://merchant.example.com/cb',
        'account_number' => '1',
        'ifsc' => 'HDFC0001234',
        'name' => 'A',
        'bank_name' => 'B',
    ];

    $this->postJson('/v1/payout', array_merge($base, ['signature' => str_repeat('a', 32)]))
        ->assertStatus(400)
        ->assertJsonPath('message', 'Invalid signature');
});

test('merchant callback is sent when payout status becomes success', function () {
    Http::fake();

    $user = User::factory()->create([
        'merchant_id' => 100_555_005,
        'payout_fee_percent' => '0',
    ]);

    $base = [
        'merchant_id' => '100555005',
        'payment_type' => 'inr',
        'amount' => 10,
        'transaction_id' => 'WD_CB_1',
        'callback_url' => 'https://merchant.example.com/payout-callback',
        'account_number' => '1',
        'ifsc' => 'HDFC0001234',
        'name' => 'A',
        'bank_name' => 'B',
    ];
    $sig = PayoutRequestSignature::compute($base, $user->payout_api_key);
    $this->postJson('/v1/payout', array_merge($base, ['signature' => $sig]))->assertOk();

    $order = PaymentOrder::query()->where('transaction_id', 'WD_CB_1')->firstOrFail();
    $order->update(['status' => PaymentOrderStatus::Success]);

    Http::assertSent(function ($request) {
        $data = $request->data();

        return $request->url() === 'https://merchant.example.com/payout-callback'
            && ($data['status'] ?? null) === 'SUCCESS'
            && ($data['transaction_id'] ?? null) === 'WD_CB_1'
            && ($data['amount'] ?? null) === '10.00';
    });
});
