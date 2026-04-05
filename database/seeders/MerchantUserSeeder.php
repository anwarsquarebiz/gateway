<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MerchantUserSeeder extends Seeder
{
    /**
     * Seed merchant users (merchant_id is required).
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'merchant@example.com'],
            [
                'name' => 'Merchant User',
                'password' => Hash::make('password'),
                'merchant_id' => 100555093,
                'role' => UserRole::Merchant,
                'email_verified_at' => now(),
            ]
        );
    }
}
