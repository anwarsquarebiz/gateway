<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collection_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('collection_orders', 'payment_type')) {
                $table->string('payment_type', 16)->nullable()->after('merchant_order_no');
            }
            if (! Schema::hasColumn('collection_orders', 'admin_upi_id')) {
                $table->foreignId('admin_upi_id')->nullable()->after('payment_type')->constrained('admin_upi_ids')->nullOnDelete();
            }
            if (! Schema::hasColumn('collection_orders', 'admin_usdt_address_id')) {
                $table->foreignId('admin_usdt_address_id')->nullable()->after('admin_upi_id')->constrained('admin_usdt_addresses')->nullOnDelete();
            }
            if (! Schema::hasColumn('collection_orders', 'receiving_upi_id')) {
                $table->string('receiving_upi_id')->nullable()->after('admin_usdt_address_id');
            }
            if (! Schema::hasColumn('collection_orders', 'receiving_usdt_address')) {
                $table->string('receiving_usdt_address', 255)->nullable()->after('receiving_upi_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('collection_orders', function (Blueprint $table) {
            if (Schema::hasColumn('collection_orders', 'receiving_usdt_address')) {
                $table->dropColumn('receiving_usdt_address');
            }
            if (Schema::hasColumn('collection_orders', 'receiving_upi_id')) {
                $table->dropColumn('receiving_upi_id');
            }
            if (Schema::hasColumn('collection_orders', 'admin_usdt_address_id')) {
                $table->dropForeign(['admin_usdt_address_id']);
                $table->dropColumn('admin_usdt_address_id');
            }
            if (Schema::hasColumn('collection_orders', 'admin_upi_id')) {
                $table->dropForeign(['admin_upi_id']);
                $table->dropColumn('admin_upi_id');
            }
            if (Schema::hasColumn('collection_orders', 'payment_type')) {
                $table->dropColumn('payment_type');
            }
        });
    }
};
