<?php

namespace App\Models;

use App\Enums\PaymentOrderStatus;
use App\Enums\PayoutPaymentType;
use Illuminate\Database\Eloquent\Model;

class PaymentOrder extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'transaction_id',
        'payment_type',
        'amount',
        'fee',
        'final_amount',
        'total_amount',
        'usdt_wallet_address',
        'bank_name',
        'account_holder',
        'account_number',
        'ifsc_code',
        'upi_id',
        'payment_reference_id',
        'callback_url',
        'callback_status',
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
            'fee' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'payment_type' => PayoutPaymentType::class,
            'status' => PaymentOrderStatus::class,
        ];
    }
}
