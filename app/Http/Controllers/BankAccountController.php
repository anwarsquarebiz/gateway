<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otp,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:255'],
            'account_holder' => ['required', 'string', 'max:255'],
            'account_number' => ['required', 'string', 'max:64'],
            'ifsc_code' => ['required', 'string', 'max:32'],
            'otp_code' => ['required', 'digits:6'],
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! $this->otp->verify($user, 'bank_add', $validated['otp_code'], null)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.'])->withInput();
        }

        $user->bankAccounts()->create([
            'bank_name' => $validated['bank_name'],
            'account_holder' => $validated['account_holder'],
            'account_number' => $validated['account_number'],
            'ifsc_code' => strtoupper($validated['ifsc_code']),
        ]);

        return back()->with('status', 'bank-account-saved');
    }

    public function update(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($bankAccount->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:255'],
            'account_holder' => ['required', 'string', 'max:255'],
            'account_number' => ['required', 'string', 'max:64'],
            'ifsc_code' => ['required', 'string', 'max:32'],
            'otp_code' => ['required', 'digits:6'],
        ]);

        if (! $this->otp->verify($user, 'bank_edit', $validated['otp_code'], $bankAccount->id)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.']);
        }

        $bankAccount->update([
            'bank_name' => $validated['bank_name'],
            'account_holder' => $validated['account_holder'],
            'account_number' => $validated['account_number'],
            'ifsc_code' => strtoupper($validated['ifsc_code']),
        ]);

        return back()->with('status', 'bank-account-updated');
    }

    public function destroy(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($bankAccount->user_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $bankAccount->delete();

        return back()->with('status', 'bank-account-deleted');
    }
}
