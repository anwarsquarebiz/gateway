<?php

use App\Http\Controllers\Api\V1\CreateCollectionOrderController;
use Illuminate\Support\Facades\Route;

Route::post('create', CreateCollectionOrderController::class)
    ->middleware('throttle:120,1');
