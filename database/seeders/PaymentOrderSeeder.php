<?php

namespace Database\Seeders;

use App\Enums\PaymentOrderStatus;
use App\Models\PaymentOrder;
use Illuminate\Database\Seeder;

class PaymentOrderSeeder extends Seeder
{
    private const MERCHANT_ID = 100555093;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'transaction_id' => 'TXN-20260329-0001',
                'amount' => '3500.00',
                'usdt_wallet_address' => 'TXYZabcdefghijklmnopqrstuvwxyz1234567890',
                'bank_name' => 'State Bank of India',
                'account_holder' => 'Acme Payments Pvt Ltd',
                'account_number' => '12345678901',
                'ifsc_code' => 'SBIN0001234',
                'status' => PaymentOrderStatus::Success,
            ],
            [
                'transaction_id' => 'TXN-20260329-0002',
                'amount' => '875.25',
                'usdt_wallet_address' => 'TAbCdEfGhIjKlMnOpQrStUvWxYz0123456789',
                'bank_name' => 'HDFC Bank',
                'account_holder' => 'Acme Payments Pvt Ltd',
                'account_number' => '50100233445566',
                'ifsc_code' => 'HDFC0000999',
                'status' => PaymentOrderStatus::Pending,
            ],
            [
                'transaction_id' => 'TXN-20260329-0003',
                'amount' => '10000.00',
                'usdt_wallet_address' => 'TQmN88pLkJhGfEdCbA0987654321ZzYyXxWwVv',
                'bank_name' => 'ICICI Bank',
                'account_holder' => 'Acme Payments Pvt Ltd',
                'account_number' => '000901234567',
                'ifsc_code' => 'ICIC0006282',
                'status' => PaymentOrderStatus::Processing,
            ],
            [
                'transaction_id' => 'TXN-20260329-0004',
                'amount' => '199.00',
                'usdt_wallet_address' => 'TShortAddrDemo1234567890123456789',
                'bank_name' => 'Axis Bank',
                'account_holder' => 'Acme Payments Pvt Ltd',
                'account_number' => '91000000001234',
                'ifsc_code' => 'UTIB0001234',
                'status' => PaymentOrderStatus::Failed,
            ],
        ];

        foreach ($rows as $data) {
            PaymentOrder::updateOrCreate(
                ['transaction_id' => $data['transaction_id']],
                array_merge($data, ['merchant_id' => self::MERCHANT_ID])
            );
        }
    }
}
