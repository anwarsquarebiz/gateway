<?php

namespace App\Enums;

enum UsdtBlockchain: string
{
    case Erc20 = 'erc20';
    case Trc20 = 'trc20';

    public function label(): string
    {
        return match ($this) {
            self::Erc20 => 'ERC20',
            self::Trc20 => 'TRC20',
        };
    }
}
