<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\UsdtWallet;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class EmailOtpService
{
    public function send(User $user, string $purpose, ?int $purposeId = null): void
    {
        $this->assertPurposeAllowed($user, $purpose, $purposeId);

        $code = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);

        Cache::put($this->cacheKey($user, $purpose, $purposeId), $code, now()->addMinutes(10));

        Mail::raw(
            "Your verification code is: {$code}\n\nThis code expires in 10 minutes.",
            function ($message) use ($user) {
                $message->to($user->email)->subject('Verification code');
            }
        );
    }

    public function verify(User $user, string $purpose, string $code, ?int $purposeId = null): bool
    {
        $key = $this->cacheKey($user, $purpose, $purposeId);
        $cached = Cache::get($key);

        if (! is_string($cached) || ! hash_equals($cached, $code)) {
            return false;
        }

        Cache::forget($key);

        return true;
    }

    private function cacheKey(User $user, string $purpose, ?int $purposeId): string
    {
        if ($purposeId !== null) {
            return "email_otp:{$user->id}:{$purpose}:{$purposeId}";
        }

        return "email_otp:{$user->id}:{$purpose}";
    }

    private function assertPurposeAllowed(User $user, string $purpose, ?int $purposeId): void
    {
        if (in_array($purpose, ['bank_edit', 'usdt_edit'], true) && $purposeId === null) {
            abort(422, 'Resource id is required for this verification.');
        }

        if ($purpose === 'bank_edit' && $purposeId !== null) {
            $exists = BankAccount::query()
                ->where('id', $purposeId)
                ->where('user_id', $user->id)
                ->exists();
            if (! $exists) {
                abort(404);
            }
        }

        if ($purpose === 'usdt_edit' && $purposeId !== null) {
            $exists = UsdtWallet::query()
                ->where('id', $purposeId)
                ->where('user_id', $user->id)
                ->exists();
            if (! $exists) {
                abort(404);
            }
        }
    }
}
