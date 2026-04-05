<?php

namespace App\Support;

class TenantContext
{
    protected static ?int $merchantId = null;

    public static function setMerchantId(?int $merchantId): void
    {
        self::$merchantId = $merchantId;
    }

    public static function merchantId(): ?int
    {
        return self::$merchantId;
    }

    public static function clear(): void
    {
        self::$merchantId = null;
    }
}
