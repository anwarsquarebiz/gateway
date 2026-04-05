<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collection_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('collection_orders', 'nowpayments_payment_id')) {
                $table->string('nowpayments_payment_id', 64)->nullable()->after('receiving_usdt_address')->index();
            }
            if (! Schema::hasColumn('collection_orders', 'nowpayments_pay_amount')) {
                $table->string('nowpayments_pay_amount', 64)->nullable()->after('nowpayments_payment_id');
            }
            if (! Schema::hasColumn('collection_orders', 'nowpayments_pay_currency')) {
                $table->string('nowpayments_pay_currency', 32)->nullable()->after('nowpayments_pay_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('collection_orders', function (Blueprint $table) {
            $drop = array_values(array_filter([
                Schema::hasColumn('collection_orders', 'nowpayments_pay_currency') ? 'nowpayments_pay_currency' : null,
                Schema::hasColumn('collection_orders', 'nowpayments_pay_amount') ? 'nowpayments_pay_amount' : null,
                Schema::hasColumn('collection_orders', 'nowpayments_payment_id') ? 'nowpayments_payment_id' : null,
            ]));
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};
