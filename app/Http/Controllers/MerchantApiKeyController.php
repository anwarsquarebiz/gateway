<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MerchantApiKeyController extends Controller
{
    public function regeneratePayin(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->isMerchant(), 403);

        $user->forceFill([
            'payin_api_key' => User::generateUniqueApiKey('payin_api_key'),
        ])->save();

        return back()->with('status', 'payin-api-key-regenerated');
    }

    public function regeneratePayout(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->isMerchant(), 403);

        $user->forceFill([
            'payout_api_key' => User::generateUniqueApiKey('payout_api_key'),
        ])->save();

        return back()->with('status', 'payout-api-key-regenerated');
    }
}
