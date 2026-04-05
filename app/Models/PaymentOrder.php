<?php

namespace App\Models;

use App\Enums\PaymentOrderStatus;
use Illuminate\Database\Eloquent\Model;

class PaymentOrder extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'transaction_id',
        'amount',
        'usdt_wallet_address',
        'bank_name',
        'account_holder',
        'account_number',
        'ifsc_code',
        'payment_reference_id',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'merchant_id' => 'integer',
            'amount' => 'decimal:2',
            'status' => PaymentOrderStatus::class,
        ];
    }
}
