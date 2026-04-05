<?php

namespace App\Models;

use App\Enums\UserRole;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'two_factor_enabled',
        'merchant_id',
        'role',
        'payin_fee_percent',
        'payout_fee_percent',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'payin_api_key',
        'payout_api_key',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'merchant_id' => 'integer',
            'role' => UserRole::class,
            'payin_fee_percent' => 'decimal:2',
            'payout_fee_percent' => 'decimal:2',
        ];
    }

    /**
     * @phpstan-param 'payin_api_key'|'payout_api_key' $column
     */
    public static function generateUniqueApiKey(string $column): string
    {
        if (! in_array($column, ['payin_api_key', 'payout_api_key'], true)) {
            throw new \InvalidArgumentException('Invalid API key column.');
        }

        do {
            $key = 'pk_'.Str::lower(bin2hex(random_bytes(24)));
        } while (static::query()->where($column, $key)->exists());

        return $key;
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if ($user->payin_api_key === null || $user->payin_api_key === '') {
                $user->payin_api_key = static::generateUniqueApiKey('payin_api_key');
            }
            if ($user->payout_api_key === null || $user->payout_api_key === '') {
                $user->payout_api_key = static::generateUniqueApiKey('payout_api_key');
            }
        });
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isBroker(): bool
    {
        return $this->role === UserRole::Broker;
    }

    public function isMerchant(): bool
    {
        return $this->role === UserRole::Merchant;
    }

    /**
     * @return HasMany<BankAccount, $this>
     */
    public function bankAccounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }

    /**
     * @return HasMany<UsdtWallet, $this>
     */
    public function usdtWallets(): HasMany
    {
        return $this->hasMany(UsdtWallet::class);
    }

    /**
     * @return HasMany<UserUpiId, $this>
     */
    public function userUpiIds(): HasMany
    {
        return $this->hasMany(UserUpiId::class);
    }

    /**
     * @return HasMany<AdminUpiId, $this>
     */
    public function adminUpiIds(): HasMany
    {
        return $this->hasMany(AdminUpiId::class);
    }

    /**
     * @return HasMany<AdminUsdtAddress, $this>
     */
    public function adminUsdtAddresses(): HasMany
    {
        return $this->hasMany(AdminUsdtAddress::class);
    }
}
