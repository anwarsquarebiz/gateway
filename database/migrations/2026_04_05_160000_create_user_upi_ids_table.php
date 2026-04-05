<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_upi_ids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('upi_id', 128);
            $table->timestamps();

            $table->unique(['user_id', 'upi_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_upi_ids');
    }
};
