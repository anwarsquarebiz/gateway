<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MerchantUserSeeder::class,
            BrokerUserSeeder::class,
            AdminUserSeeder::class,
            CollectionOrderSeeder::class,
            PaymentOrderSeeder::class,
            FundDetailSeeder::class,
            WalletBalanceSeeder::class,
            BankAccountSeeder::class,
            UsdtWalletSeeder::class,
        ]);
    }
}
