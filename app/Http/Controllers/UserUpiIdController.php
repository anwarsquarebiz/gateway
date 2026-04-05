<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserUpiId;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserUpiIdController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otp,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'upi_id' => [
                'required',
                'string',
                'max:128',
                'regex:/^[^\s@]+@[^\s@]+$/',
                Rule::unique('user_upi_ids', 'upi_id')->where('user_id', $user->id),
            ],
            'otp_code' => ['required', 'digits:6'],
        ]);

        if (! $this->otp->verify($user, 'upi_add', $validated['otp_code'], null)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.'])->withInput();
        }

        $user->userUpiIds()->create([
            'upi_id' => strtolower(trim($validated['upi_id'])),
        ]);

        return back()->with('status', 'upi-id-saved');
    }

    public function update(Request $request, UserUpiId $userUpiId): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($userUpiId->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'upi_id' => [
                'required',
                'string',
                'max:128',
                'regex:/^[^\s@]+@[^\s@]+$/',
                Rule::unique('user_upi_ids', 'upi_id')->where('user_id', $user->id)->ignore($userUpiId->id),
            ],
            'otp_code' => ['required', 'digits:6'],
        ]);

        if (! $this->otp->verify($user, 'upi_edit', $validated['otp_code'], $userUpiId->id)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.']);
        }

        $userUpiId->update([
            'upi_id' => strtolower(trim($validated['upi_id'])),
        ]);

        return back()->with('status', 'upi-id-updated');
    }

    public function destroy(Request $request, UserUpiId $userUpiId): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($userUpiId->user_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $userUpiId->delete();

        return back()->with('status', 'upi-id-deleted');
    }
}
