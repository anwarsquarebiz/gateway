<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrokerMerchantController extends Controller
{
    /**
     * List merchants for the logged-in broker.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var User $authUser */
        $authUser = $request->user();

        if ($authUser->role === UserRole::Merchant) {
            return redirect()->route('dashboard');
        }

        $query = User::query()
            ->where('role', UserRole::Merchant)
            ->orderBy('name');

        if ($authUser->role === UserRole::Broker) {
            $query->where('broker_id', $authUser->id);
        }

        $merchants = $query
            ->paginate(15)
            ->through(fn (User $merchant) => [
                'id' => $merchant->id,
                'name' => $merchant->name,
                'merchant_id' => $merchant->merchant_id,
                'created_at' => $merchant->created_at?->toIso8601String(),
            ]);

        return Inertia::render('merchants', [
            'merchants' => $merchants,
        ]);
    }
}

