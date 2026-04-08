<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'broker_id')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table
                ->foreignId('broker_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->after('merchant_id');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'broker_id')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('broker_id');
        });
    }
};

