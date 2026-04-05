<?php

namespace Database\Seeders;

use App\Enums\FundDetailType;
use App\Models\FundDetail;
use Illuminate\Database\Seeder;

class FundDetailSeeder extends Seeder
{
    private const MERCHANT_ID = 100555093;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'transaction_id' => 'FD-TXN-20260329-0001',
                'type' => FundDetailType::Credit,
                'amount' => '10000.00',
                'fee' => '0.00',
                'final_amount' => '10000.00',
                'balance_before' => '0.00',
                'balance_after' => '10000.00',
                'transaction_date' => now()->subDays(5)->startOfDay(),
            ],
            [
                'transaction_id' => 'FD-TXN-20260329-0002',
                'type' => FundDetailType::Debit,
                'amount' => '500.00',
                'fee' => '10.00',
                'final_amount' => '490.00',
                'balance_before' => '10000.00',
                'balance_after' => '9510.00',
                'transaction_date' => now()->subDays(4)->setTime(14, 30),
            ],
            [
                'transaction_id' => 'FD-TXN-20260329-0003',
                'type' => FundDetailType::Credit,
                'amount' => '2500.00',
                'fee' => '12.50',
                'final_amount' => '2487.50',
                'balance_before' => '9510.00',
                'balance_after' => '11997.50',
                'transaction_date' => now()->subDays(3)->setTime(9, 15),
            ],
            [
                'transaction_id' => 'FD-TXN-20260329-0004',
                'type' => FundDetailType::Debit,
                'amount' => '1200.00',
                'fee' => '5.00',
                'final_amount' => '1195.00',
                'balance_before' => '11997.50',
                'balance_after' => '10802.50',
                'transaction_date' => now()->subDays(2)->setTime(18, 0),
            ],
            [
                'transaction_id' => 'FD-TXN-20260329-0005',
                'type' => FundDetailType::Credit,
                'amount' => '100.00',
                'fee' => '0.00',
                'final_amount' => '100.00',
                'balance_before' => '10802.50',
                'balance_after' => '10902.50',
                'transaction_date' => now()->subDay()->setTime(11, 45),
            ],
        ];

        foreach ($rows as $data) {
            FundDetail::updateOrCreate(
                ['transaction_id' => $data['transaction_id']],
                array_merge($data, ['merchant_id' => self::MERCHANT_ID])
            );
        }
    }
}
