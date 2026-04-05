<?php

use App\Models\User;
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
        Schema::table('users', function (Blueprint $table) {
            $table->string('payin_api_key', 80)->nullable()->unique()->after('remember_token');
            $table->string('payout_api_key', 80)->nullable()->unique()->after('payin_api_key');
            $table->decimal('payin_fee_percent', 5, 2)->default(11)->after('payout_api_key');
            $table->decimal('payout_fee_percent', 5, 2)->default(4)->after('payin_fee_percent');
        });

        foreach (User::query()->cursor() as $user) {
            $dirty = false;
            if ($user->payin_api_key === null) {
                $user->payin_api_key = User::generateUniqueApiKey('payin_api_key');
                $dirty = true;
            }
            if ($user->payout_api_key === null) {
                $user->payout_api_key = User::generateUniqueApiKey('payout_api_key');
                $dirty = true;
            }
            if ($dirty) {
                $user->saveQuietly();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'payin_api_key',
                'payout_api_key',
                'payin_fee_percent',
                'payout_fee_percent',
            ]);
        });
    }
};
