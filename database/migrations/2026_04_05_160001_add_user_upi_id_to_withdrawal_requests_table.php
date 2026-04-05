<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->foreignId('user_upi_id')->nullable()->after('usdt_wallet_id')->constrained('user_upi_ids')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->dropForeign(['user_upi_id']);
            $table->dropColumn('user_upi_id');
        });
    }
};
