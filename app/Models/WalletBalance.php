<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletBalance extends Model
{
    /**
     * @var string
     */
    protected $table = 'wallet_balance';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'balance',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'merchant_id' => 'integer',
            'balance' => 'decimal:2',
        ];
    }
}
