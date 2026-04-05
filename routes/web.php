<?php

use App\Http\Controllers\Admin\AdminUpiIdController;
use App\Http\Controllers\Admin\AdminUsdtAddressController;
use App\Http\Controllers\Admin\CollectionOrderReviewController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\CollectionOrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FundDetailController;
use App\Http\Controllers\MerchantApiKeyController;
use App\Http\Controllers\NowPaymentsIpnController;
use App\Http\Controllers\PayinDocsController;
use App\Http\Controllers\PaymentOrderController;
use App\Http\Controllers\PayOrderController;
use App\Http\Controllers\SubmitPayOrderUtrController;
use App\Http\Controllers\UsdtWalletController;
use App\Http\Controllers\VerificationOtpController;
use App\Http\Controllers\WithdrawController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('pay/{order_no}', PayOrderController::class)->name('pay.show');
Route::post('pay/{order_no}/utr', SubmitPayOrderUtrController::class)
    ->middleware('throttle:30,1')
    ->name('pay.utr');
Route::post('nowpayments/ipn', NowPaymentsIpnController::class)
    ->middleware('throttle:120,1')
    ->name('nowpayments.ipn');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::post('merchant/api-keys/payin/regenerate', [MerchantApiKeyController::class, 'regeneratePayin'])
        ->name('merchant.api-keys.regenerate-payin');
    Route::post('merchant/api-keys/payout/regenerate', [MerchantApiKeyController::class, 'regeneratePayout'])
        ->name('merchant.api-keys.regenerate-payout');

    Route::get('collection-orders', [CollectionOrderController::class, 'index'])->name('collection-orders');

    Route::get('payin', PayinDocsController::class)->name('docs.payin');

    Route::get('payment-orders', [PaymentOrderController::class, 'index'])->name('payment-orders');

    Route::get('fund-details', [FundDetailController::class, 'index'])->name('fund-details');

    Route::get('withdraw', [WithdrawController::class, 'index'])->name('withdraw');
    Route::post('withdraw', [WithdrawController::class, 'store'])->name('withdraw.store');

    Route::post('verification/send-otp', [VerificationOtpController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send-otp');

    Route::post('bank-accounts', [BankAccountController::class, 'store'])->name('bank-accounts.store');
    Route::patch('bank-accounts/{bankAccount}', [BankAccountController::class, 'update'])->name('bank-accounts.update');
    Route::delete('bank-accounts/{bankAccount}', [BankAccountController::class, 'destroy'])->name('bank-accounts.destroy');

    Route::post('usdt-wallets', [UsdtWalletController::class, 'store'])->name('usdt-wallets.store');
    Route::patch('usdt-wallets/{usdtWallet}', [UsdtWalletController::class, 'update'])->name('usdt-wallets.update');
    Route::delete('usdt-wallets/{usdtWallet}', [UsdtWalletController::class, 'destroy'])->name('usdt-wallets.destroy');

    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/create', [AdminUserController::class, 'create'])->name('users.create');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::get('users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/api-keys/payin/regenerate', [AdminUserController::class, 'regeneratePayinApiKey'])->name('users.regenerate-payin-api-key');
        Route::post('users/{user}/api-keys/payout/regenerate', [AdminUserController::class, 'regeneratePayoutApiKey'])->name('users.regenerate-payout-api-key');

        Route::get('upi-ids', [AdminUpiIdController::class, 'index'])->name('upi-ids.index');
        Route::get('upi-ids/create', [AdminUpiIdController::class, 'create'])->name('upi-ids.create');
        Route::post('upi-ids', [AdminUpiIdController::class, 'store'])->name('upi-ids.store');
        Route::get('upi-ids/{adminUpiId}/edit', [AdminUpiIdController::class, 'edit'])->name('upi-ids.edit');
        Route::patch('upi-ids/{adminUpiId}', [AdminUpiIdController::class, 'update'])->name('upi-ids.update');
        Route::delete('upi-ids/{adminUpiId}', [AdminUpiIdController::class, 'destroy'])->name('upi-ids.destroy');

        Route::get('usdt-addresses', [AdminUsdtAddressController::class, 'index'])->name('usdt-addresses.index');
        Route::get('usdt-addresses/create', [AdminUsdtAddressController::class, 'create'])->name('usdt-addresses.create');
        Route::post('usdt-addresses', [AdminUsdtAddressController::class, 'store'])->name('usdt-addresses.store');
        Route::get('usdt-addresses/{adminUsdtAddress}/edit', [AdminUsdtAddressController::class, 'edit'])->name('usdt-addresses.edit');
        Route::patch('usdt-addresses/{adminUsdtAddress}', [AdminUsdtAddressController::class, 'update'])->name('usdt-addresses.update');
        Route::delete('usdt-addresses/{adminUsdtAddress}', [AdminUsdtAddressController::class, 'destroy'])->name('usdt-addresses.destroy');

        Route::post('collection-orders/{collectionOrder}/accept', [CollectionOrderReviewController::class, 'accept'])
            ->middleware('throttle:60,1')
            ->name('collection-orders.accept');
        Route::post('collection-orders/{collectionOrder}/reject', [CollectionOrderReviewController::class, 'reject'])
            ->middleware('throttle:60,1')
            ->name('collection-orders.reject');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
