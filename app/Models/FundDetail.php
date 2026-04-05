<?php

namespace App\Models;

use App\Enums\FundDetailType;
use Illuminate\Database\Eloquent\Model;

class FundDetail extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'type',
        'transaction_id',
        'amount',
        'fee',
        'final_amount',
        'balance_before',
        'balance_after',
        'transaction_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'merchant_id' => 'integer',
            'type' => FundDetailType::class,
            'amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'transaction_date' => 'datetime',
        ];
    }
}
