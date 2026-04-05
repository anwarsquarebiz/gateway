<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VerificationOtpController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otp,
    ) {}

    /**
     * Send a 6-digit OTP to the user's email for the given purpose.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'purpose' => [
                'required',
                'string',
                Rule::in(['withdraw', 'bank_add', 'bank_edit', 'usdt_add', 'usdt_edit']),
            ],
            'purpose_id' => ['nullable', 'integer', 'min:1'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $this->otp->send($user, $validated['purpose'], $validated['purpose_id'] ?? null);

        return back()->with('status', 'verification-otp-sent');
    }
}
