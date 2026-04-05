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
        if (! Schema::hasTable('users')) {
            return;
        }

        if (! Schema::hasColumn('users', 'is_super_user')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_super_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        if (Schema::hasColumn('users', 'is_super_user')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_user')->default(false);
        });
    }
};
