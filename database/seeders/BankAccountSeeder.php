<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use App\Models\User;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    /**
     * Seed sample bank accounts for demo users.
     */
    public function run(): void
    {
        $merchant = User::query()->where('email', 'merchant@example.com')->first();
        if ($merchant === null) {
            return;
        }

        BankAccount::updateOrCreate(
            [
                'user_id' => $merchant->id,
                'account_number' => '50100456789012',
            ],
            [
                'bank_name' => 'HDFC Bank',
                'account_holder' => 'Merchant User',
                'ifsc_code' => 'HDFC0001234',
            ]
        );

        BankAccount::updateOrCreate(
            [
                'user_id' => $merchant->id,
                'account_number' => '31987654321098',
            ],
            [
                'bank_name' => 'ICICI Bank',
                'account_holder' => 'Merchant User',
                'ifsc_code' => 'ICIC0005678',
            ]
        );

        $broker = User::query()->where('email', 'broker@example.com')->first();
        if ($broker !== null) {
            BankAccount::updateOrCreate(
                [
                    'user_id' => $broker->id,
                    'account_number' => '11223344556677',
                ],
                [
                    'bank_name' => 'State Bank of India',
                    'account_holder' => 'Broker User',
                    'ifsc_code' => 'SBIN0001234',
                ]
            );
        }
    }
}
