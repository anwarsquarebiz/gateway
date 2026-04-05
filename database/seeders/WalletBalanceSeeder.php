<?php

namespace Database\Seeders;

use App\Models\WalletBalance;
use Illuminate\Database\Seeder;

class WalletBalanceSeeder extends Seeder
{
    private const MERCHANT_ID = 100555093;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WalletBalance::updateOrCreate(
            ['merchant_id' => self::MERCHANT_ID],
            ['balance' => '10902.50']
        );
    }
}
