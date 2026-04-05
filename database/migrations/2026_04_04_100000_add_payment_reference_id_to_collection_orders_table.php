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
        Schema::table('collection_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('collection_orders', 'payment_reference_id')) {
                $table->string('payment_reference_id')->nullable()->after('order_no');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('collection_orders', function (Blueprint $table) {
            if (Schema::hasColumn('collection_orders', 'payment_reference_id')) {
                $table->dropColumn('payment_reference_id');
            }
        });
    }
};
