<?php

namespace Database\Seeders;

use App\Enums\CollectionOrderStatus;
use App\Models\CollectionOrder;
use Illuminate\Database\Seeder;

class CollectionOrderSeeder extends Seeder
{
    private const MERCHANT_ID = 100555093;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'order_no' => 'CO-20260329-0001',
                'merchant_order_no' => 'M-ORD-1001',
                'amount' => '5000.00',
                'fee' => '25.00',
                'final_amount' => '4975.00',
                'status' => CollectionOrderStatus::Success,
                'callback_status' => 'delivered',
                'callback_url' => 'https://example.com/callback/1001',
                'extra' => null,
            ],
            [
                'order_no' => 'CO-20260329-0002',
                'merchant_order_no' => 'M-ORD-1002',
                'amount' => '1200.50',
                'fee' => '10.00',
                'final_amount' => '1190.50',
                'status' => CollectionOrderStatus::Created,
                'callback_status' => 'pending',
                'callback_url' => 'https://example.com/callback/1002',
                'extra' => null,
            ],
            [
                'order_no' => 'CO-20260329-0003',
                'merchant_order_no' => 'M-ORD-1003',
                'amount' => '999.99',
                'fee' => '5.00',
                'final_amount' => '994.99',
                'status' => CollectionOrderStatus::Failed,
                'callback_status' => 'failed',
                'callback_url' => 'https://example.com/callback/1003',
                'extra' => null,
            ],
            [
                'order_no' => 'CO-20260329-0004',
                'merchant_order_no' => 'M-ORD-1004',
                'amount' => '25000.00',
                'fee' => '100.00',
                'final_amount' => '24900.00',
                'status' => CollectionOrderStatus::Success,
                'callback_status' => 'delivered',
                'callback_url' => 'https://example.com/callback/1004',
                'extra' => null,
            ],
        ];

        foreach ($rows as $data) {
            CollectionOrder::updateOrCreate(
                ['order_no' => $data['order_no']],
                array_merge($data, ['merchant_id' => self::MERCHANT_ID])
            );
        }
    }
}
