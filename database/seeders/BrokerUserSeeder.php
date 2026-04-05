<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BrokerUserSeeder extends Seeder
{
    /**
     * Seed broker users (merchant_id optional — omitted).
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'broker@example.com'],
            [
                'name' => 'Broker User',
                'password' => Hash::make('password'),
                'merchant_id' => null,
                'role' => UserRole::Broker,
                'email_verified_at' => now(),
            ]
        );
    }
}
