<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('merchant_id')->nullable()->index();
            $table->string('method', 16);
            $table->foreignId('bank_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('usdt_wallet_id')->nullable()->constrained('usdt_wallets')->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->decimal('fee_percent', 5, 2);
            $table->decimal('fee_fixed', 15, 2);
            $table->decimal('fee_amount', 15, 2);
            $table->decimal('total_deducted', 15, 2);
            $table->string('status', 32)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};
