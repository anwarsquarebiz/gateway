<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginTwoFactorController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otp,
    ) {}

    /**
     * Show the email OTP challenge after password login.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $this->resolvePendingUser($request);
        if ($user === null) {
            return redirect()->route('login')->with('status', 'login-session-expired');
        }

        return Inertia::render('auth/login-otp', [
            'emailMasked' => $this->maskEmail($user->email),
        ]);
    }

    /**
     * Complete login after OTP verification.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'regex:/^\d{6}$/'],
        ]);

        $user = $this->resolvePendingUser($request);
        if ($user === null) {
            return redirect()->route('login')->with('status', 'login-session-expired');
        }

        $rateKey = 'login-otp-verify:'.$request->session()->getId();

        if (RateLimiter::tooManyAttempts($rateKey, 10)) {
            $seconds = RateLimiter::availableIn($rateKey);

            throw ValidationException::withMessages([
                'code' => __('Too many attempts. Try again in :seconds seconds.', ['seconds' => $seconds]),
            ]);
        }

        if (! $this->otp->verify($user, 'login', $request->string('code'))) {
            RateLimiter::hit($rateKey, 60);

            throw ValidationException::withMessages([
                'code' => __('The code you entered is invalid or has expired.'),
            ]);
        }

        RateLimiter::clear($rateKey);

        $remember = (bool) $request->session()->pull('two_factor_remember', false);
        $request->session()->forget('two_factor_user_id');

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Resend the login OTP email.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = $this->resolvePendingUser($request);
        if ($user === null) {
            return redirect()->route('login')->with('status', 'login-session-expired');
        }

        $this->otp->send($user, 'login');

        return back()->with('status', 'login-otp-sent');
    }

    private function resolvePendingUser(Request $request): ?User
    {
        $id = $request->session()->get('two_factor_user_id');

        /** @var User|null $user */
        $user = User::query()->find($id);

        if ($user === null) {
            $request->session()->forget(['two_factor_user_id', 'two_factor_remember']);
        }

        return $user;
    }

    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email, 2);
        if (count($parts) !== 2) {
            return '***';
        }

        [$local, $domain] = $parts;
        $keep = min(2, max(1, strlen($local)));
        $maskedLocal = substr($local, 0, $keep).str_repeat('•', max(3, strlen($local) - $keep));

        return $maskedLocal.'@'.$domain;
    }
}
