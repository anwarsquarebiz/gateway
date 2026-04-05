<?php

namespace App\Http\Controllers;

use App\Enums\UsdtBlockchain;
use App\Models\UsdtWallet;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsdtWalletController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otp,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'public_address' => ['required', 'string', 'max:512'],
            'blockchain' => ['required', Rule::enum(UsdtBlockchain::class)],
            'otp_code' => ['required', 'digits:6'],
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! $this->otp->verify($user, 'usdt_add', $validated['otp_code'], null)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.']);
        }

        $user->usdtWallets()->create([
            'public_address' => $validated['public_address'],
            'blockchain' => $validated['blockchain'],
        ]);

        return back()->with('status', 'usdt-wallet-saved');
    }

    public function update(Request $request, UsdtWallet $usdtWallet): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($usdtWallet->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'public_address' => ['required', 'string', 'max:512'],
            'blockchain' => ['required', Rule::enum(UsdtBlockchain::class)],
            'otp_code' => ['required', 'digits:6'],
        ]);

        if (! $this->otp->verify($user, 'usdt_edit', $validated['otp_code'], $usdtWallet->id)) {
            return back()->withErrors(['otp_code' => 'Invalid or expired verification code.']);
        }

        $usdtWallet->update([
            'public_address' => $validated['public_address'],
            'blockchain' => $validated['blockchain'],
        ]);

        return back()->with('status', 'usdt-wallet-updated');
    }

    public function destroy(Request $request, UsdtWallet $usdtWallet): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($usdtWallet->user_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $usdtWallet->delete();

        return back()->with('status', 'usdt-wallet-deleted');
    }
}
