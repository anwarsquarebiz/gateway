<?php

use App\Http\Controllers\Api\V1\CreateCollectionOrderController;
use App\Http\Controllers\Api\V1\CreatePayoutOrderController;
use Illuminate\Support\Facades\Route;

Route::post('create', CreateCollectionOrderController::class)
    ->middleware('throttle:120,1');

Route::post('payout', CreatePayoutOrderController::class)
    ->middleware('throttle:120,1');
