<?php

namespace App\Support;

use App\Enums\CollectionPaymentType;
use App\Models\AdminUpiId;
use App\Models\AdminUsdtAddress;
use App\Models\CollectionOrder;

final class AdminReceivingRoundRobin
{
    /**
     * Pick the next admin UPI row in stable id order, rotating after the last order that used INR.
     */
    public static function nextAdminUpi(): ?AdminUpiId
    {
        $ids = AdminUpiId::query()->orderBy('id')->pluck('id');
        if ($ids->isEmpty()) {
            return null;
        }

        /** @var list<int> $idList */
        $idList = $ids->map(fn ($id) => (int) $id)->all();

        $lastUsed = CollectionOrder::query()
            ->where('payment_type', CollectionPaymentType::Inr)
            ->whereNotNull('admin_upi_id')
            ->orderByDesc('id')
            ->value('admin_upi_id');

        $nextId = self::nextIdAfter($idList, $lastUsed !== null ? (int) $lastUsed : null);

        return AdminUpiId::query()->find($nextId);
    }

    /**
     * Pick the next admin USDT address row in stable id order, rotating after the last order that used USDT.
     */
    public static function nextAdminUsdtAddress(): ?AdminUsdtAddress
    {
        $ids = AdminUsdtAddress::query()->orderBy('id')->pluck('id');
        if ($ids->isEmpty()) {
            return null;
        }

        /** @var list<int> $idList */
        $idList = $ids->map(fn ($id) => (int) $id)->all();

        $lastUsed = CollectionOrder::query()
            ->where('payment_type', CollectionPaymentType::Usdt)
            ->whereNotNull('admin_usdt_address_id')
            ->orderByDesc('id')
            ->value('admin_usdt_address_id');

        $nextId = self::nextIdAfter($idList, $lastUsed !== null ? (int) $lastUsed : null);

        return AdminUsdtAddress::query()->find($nextId);
    }

    /**
     * @param  list<int>  $idList
     */
    private static function nextIdAfter(array $idList, ?int $lastUsed): int
    {
        if ($lastUsed === null) {
            return $idList[0];
        }

        $idx = array_search($lastUsed, $idList, true);

        if ($idx === false) {
            return $idList[0];
        }

        $count = count($idList);

        return $idList[($idx + 1) % $count];
    }
}
