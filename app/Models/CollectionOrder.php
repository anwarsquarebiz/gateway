<?php

namespace App\Models;

use App\Enums\CollectionOrderStatus;
use App\Enums\CollectionPaymentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionOrder extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'order_no',
        'payment_reference_id',
        'merchant_order_no',
        'payment_type',
        'admin_upi_id',
        'admin_usdt_address_id',
        'receiving_upi_id',
        'receiving_usdt_address',
        'nowpayments_payment_id',
        'nowpayments_pay_amount',
        'nowpayments_pay_currency',
        'amount',
        'fee',
        'final_amount',
        'status',
        'callback_status',
        'callback_url',
        'extra',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'merchant_id' => 'integer',
            'admin_upi_id' => 'integer',
            'admin_usdt_address_id' => 'integer',
            'amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'status' => CollectionOrderStatus::class,
            'payment_type' => CollectionPaymentType::class,
        ];
    }

    /**
     * @return BelongsTo<AdminUpiId, $this>
     */
    public function adminUpiId(): BelongsTo
    {
        return $this->belongsTo(AdminUpiId::class);
    }

    /**
     * @return BelongsTo<AdminUsdtAddress, $this>
     */
    public function adminUsdtAddress(): BelongsTo
    {
        return $this->belongsTo(AdminUsdtAddress::class);
    }
}
