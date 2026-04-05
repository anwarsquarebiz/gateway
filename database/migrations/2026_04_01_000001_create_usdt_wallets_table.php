<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usdt_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('public_address');
            $table->string('blockchain', 16);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usdt_wallets');
    }
};
