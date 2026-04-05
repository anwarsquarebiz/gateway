<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final class MerchantIdAllocator
{
    /**
     * Reserve the next unused merchant_id (monotonic, unique among users).
     */
    public static function allocate(): int
    {
        return (int) DB::transaction(function () {
            $max = User::query()->whereNotNull('merchant_id')->lockForUpdate()->max('merchant_id');

            return $max !== null ? ((int) $max) + 1 : 100_000_001;
        });
    }
}
