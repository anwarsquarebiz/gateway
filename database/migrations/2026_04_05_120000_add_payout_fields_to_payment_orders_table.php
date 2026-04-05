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
        Schema::table('payment_orders', function (Blueprint $table) {
            $table->string('payment_type', 10)->default('inr')->after('transaction_id');
            $table->decimal('fee', 15, 2)->nullable()->after('amount');
            $table->decimal('total_amount', 15, 2)->nullable()->after('fee');
            $table->text('callback_url')->nullable()->after('ifsc_code');
            $table->string('callback_status', 32)->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_type',
                'fee',
                'total_amount',
                'callback_url',
                'callback_status',
            ]);
        });
    }
};
