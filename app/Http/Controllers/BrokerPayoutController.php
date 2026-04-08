<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BrokerPayoutController extends Controller
{
    /**
     * Display broker payouts based on user role.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $broker = $request->user();

        if ($broker->role === UserRole::Broker) {
            $withdrawalRequests = WithdrawalRequest::query()
                ->where('user_id', $broker->id)
                ->latest()
                ->get();

            return Inertia::render('payouts', [
                'withdrawalRequests' => $withdrawalRequests,
            ]);
        }

        if ($broker->role === UserRole::Merchant) {
            return redirect()->route('dashboard');
        }

        if ($broker->role === UserRole::Admin) {
            $withdrawalRequests = WithdrawalRequest::query()
                ->whereRelation('user', 'role', UserRole::Broker)
                ->latest()
                ->get();

            return Inertia::render('payouts', [
                'withdrawalRequests' => $withdrawalRequests,
            ]);
        }

        return redirect()->route('dashboard');
    }
}
