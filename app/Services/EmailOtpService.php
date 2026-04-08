<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\UsdtWallet;
use App\Models\User;
use App\Models\UserUpiId;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailOtpService
{
    public function send(User $user, string $purpose, ?int $purposeId = null): void
    {
        $this->assertPurposeAllowed($user, $purpose, $purposeId);

        $code = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);

        Cache::put($this->cacheKey($user, $purpose, $purposeId), $code, now()->addMinutes(10));

        Log::info('Email OTP sent to ' . $user->email . ' for purpose ' . $purpose . ' with code ' . $code);

        [$body, $subject] = match ($purpose) {
            'login' => [
                "Your sign-in code is: {$code}\n\nThis code expires in 10 minutes. If you did not try to sign in, you can ignore this email.",
                'Your sign-in code',
            ],
            default => [
                "Your verification code is: {$code}\n\nThis code expires in 10 minutes.",
                'Verification code',
            ],
        };

        Mail::raw($body, function ($message) use ($user, $subject) {
            $message->to($user->email)->subject($subject);
        });
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
        if ($purpose === 'login') {
            return;
        }

        if (in_array($purpose, ['bank_edit', 'usdt_edit', 'upi_edit'], true) && $purposeId === null) {
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

        if ($purpose === 'upi_edit' && $purposeId !== null) {
            $exists = UserUpiId::query()
                ->where('id', $purposeId)
                ->where('user_id', $user->id)
                ->exists();
            if (! $exists) {
                abort(404);
            }
        }
    }
}
