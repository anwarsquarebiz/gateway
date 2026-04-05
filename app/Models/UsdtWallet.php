<?php

namespace App\Models;

use App\Enums\UsdtBlockchain;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsdtWallet extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'public_address',
        'blockchain',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'blockchain' => UsdtBlockchain::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
