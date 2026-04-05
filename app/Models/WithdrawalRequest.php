<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithdrawalRequest extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'merchant_id',
        'method',
        'bank_account_id',
        'usdt_wallet_id',
        'user_upi_id',
        'amount',
        'fee_percent',
        'fee_fixed',
        'fee_amount',
        'total_deducted',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'merchant_id' => 'integer',
            'bank_account_id' => 'integer',
            'usdt_wallet_id' => 'integer',
            'user_upi_id' => 'integer',
            'amount' => 'decimal:2',
            'fee_percent' => 'decimal:2',
            'fee_fixed' => 'decimal:2',
            'fee_amount' => 'decimal:2',
            'total_deducted' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<BankAccount, $this>
     */
    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    /**
     * @return BelongsTo<UsdtWallet, $this>
     */
    public function usdtWallet(): BelongsTo
    {
        return $this->belongsTo(UsdtWallet::class);
    }

    /**
     * @return BelongsTo<UserUpiId, $this>
     */
    public function userUpiId(): BelongsTo
    {
        return $this->belongsTo(UserUpiId::class, 'user_upi_id');
    }
}
