<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id')->nullable()->index();
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 15, 2);
            $table->string('usdt_wallet_address', 255);
            $table->string('bank_name');
            $table->string('account_holder');
            $table->string('account_number');
            $table->string('ifsc_code', 32);
            $table->string('status', 32)->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_orders');
    }
};
