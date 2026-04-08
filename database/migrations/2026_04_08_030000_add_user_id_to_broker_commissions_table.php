<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('broker_commissions', 'user_id')) {
            return;
        }

        Schema::table('broker_commissions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('broker_commissions', 'user_id')) {
            return;
        }

        Schema::table('broker_commissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};

