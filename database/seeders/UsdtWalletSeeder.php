<?php

namespace Database\Seeders;

use App\Enums\UsdtBlockchain;
use App\Models\UsdtWallet;
use App\Models\User;
use Illuminate\Database\Seeder;

class UsdtWalletSeeder extends Seeder
{
    /**
     * Seed sample USDT wallets for demo users.
     */
    public function run(): void
    {
        $merchant = User::query()->where('email', 'merchant@example.com')->first();
        if ($merchant === null) {
            return;
        }

        UsdtWallet::updateOrCreate(
            [
                'user_id' => $merchant->id,
                'public_address' => '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            ],
            [
                'blockchain' => UsdtBlockchain::Erc20,
            ]
        );

        UsdtWallet::updateOrCreate(
            [
                'user_id' => $merchant->id,
                'public_address' => 'TXYZopYRdj2D9XRtbG411XZZ3kMfsVk7yA',
            ],
            [
                'blockchain' => UsdtBlockchain::Trc20,
            ]
        );

        $broker = User::query()->where('email', 'broker@example.com')->first();
        if ($broker !== null) {
            UsdtWallet::updateOrCreate(
                [
                    'user_id' => $broker->id,
                    'public_address' => 'TXYZopYRdj2D9XRtbG411XZZ3kMfsVk7yB',
                ],
                [
                    'blockchain' => UsdtBlockchain::Trc20,
                ]
            );
        }
    }
}
