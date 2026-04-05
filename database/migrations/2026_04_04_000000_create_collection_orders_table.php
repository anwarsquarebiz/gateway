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
        if (! Schema::hasTable('collection_orders')) {
            Schema::create('collection_orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('merchant_id')->index();
                $table->string('order_no', 32)->unique();
                $table->string('merchant_order_no', 128);
                $table->decimal('amount', 15, 2);
                $table->decimal('fee', 15, 2);
                $table->decimal('final_amount', 15, 2);
                $table->string('status', 32);
                $table->string('callback_status', 64)->nullable();
                $table->text('callback_url')->nullable();
                $table->text('extra')->nullable();
                $table->timestamps();

                $table->unique(['merchant_id', 'merchant_order_no']);
            });

            return;
        }

        Schema::table('collection_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('collection_orders', 'callback_url')) {
                $table->text('callback_url')->nullable();
            }
            if (! Schema::hasColumn('collection_orders', 'extra')) {
                $table->text('extra')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('collection_orders')) {
            return;
        }

        if (Schema::hasColumn('collection_orders', 'callback_url') || Schema::hasColumn('collection_orders', 'extra')) {
            Schema::table('collection_orders', function (Blueprint $table) {
                $drop = array_filter([
                    Schema::hasColumn('collection_orders', 'callback_url') ? 'callback_url' : null,
                    Schema::hasColumn('collection_orders', 'extra') ? 'extra' : null,
                ]);
                if ($drop !== []) {
                    $table->dropColumn($drop);
                }
            });
        }
    }
};
