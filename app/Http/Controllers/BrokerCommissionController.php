<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\BrokerCommission;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BrokerCommissionController extends Controller
{
    /**
     * Display broker commissions based on user role.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $broker = $request->user();

        if ($broker->role === UserRole::Broker) {
            $commissions = BrokerCommission::query()
                ->where('user_id', $broker->id)
                ->orderByDesc('id')
                ->get();

            return Inertia::render('commission', [
                'commissions' => $commissions,
            ]);
        }

        if ($broker->role === UserRole::Merchant) {
            return redirect()->route('dashboard');
        }

        if ($broker->role === UserRole::Admin) {
            $commissions = BrokerCommission::query()
                ->orderByDesc('id')
                ->get();

            return Inertia::render('commission', [
                'commissions' => $commissions,
            ]);
        }

        return redirect()->route('dashboard');
    }
}

