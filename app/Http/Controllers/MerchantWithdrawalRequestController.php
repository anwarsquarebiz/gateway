<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WithdrawalRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MerchantWithdrawalRequestController extends Controller
{
    /**
     * Display withdrawal requests for the merchant center.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isMerchant()) {
            return redirect()->route('dashboard');
        }

        $query = WithdrawalRequest::query()->orderByDesc('created_at');

        if (! $user->isAdmin()) {
            if ($user->merchant_id !== null) {
                $query->where('merchant_id', $user->merchant_id);
            } else {
                $query->whereRaw('0 = 1');
            }
        } else {
            $query->whereNotNull('merchant_id');
        }

        $withdrawalRequests = $query->paginate(15)->through(fn (WithdrawalRequest $row) => [
            'id' => $row->id,
            'user_id' => $row->user_id,
            'merchant_id' => $row->merchant_id,
            'method' => $row->method,
            'amount' => $row->amount,
            'fee_percent' => $row->fee_percent,
            'fee_fixed' => $row->fee_fixed,
            'fee_amount' => $row->fee_amount,
            'total_deducted' => $row->total_deducted,
            'status' => $row->status,
            'created_at' => $row->created_at?->toIso8601String(),
            'updated_at' => $row->updated_at?->toIso8601String(),
        ]);

        return Inertia::render('withdrawal-requests', [
            'withdrawalRequests' => $withdrawalRequests,
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
