<?php

namespace App\Http\Controllers;

use App\Models\FundDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundDetailController extends Controller
{
    /**
     * Display a listing of fund detail ledger entries.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = FundDetail::query()->orderByDesc('transaction_date')->orderByDesc('id');

        if (! $user->isAdmin()) {
            if ($user->merchant_id !== null) {
                $query->where('merchant_id', $user->merchant_id);
            } else {
                $query->whereRaw('0 = 1');
            }
        }

        $funds = $query->paginate(15)->through(fn (FundDetail $row) => [
            'id' => $row->id,
            'merchant_id' => $row->merchant_id,
            'type' => $row->type->value,
            'transaction_id' => $row->transaction_id,
            'amount' => $row->amount,
            'fee' => $row->fee,
            'final_amount' => $row->final_amount,
            'balance_before' => $row->balance_before,
            'balance_after' => $row->balance_after,
            'transaction_date' => $row->transaction_date?->toIso8601String(),
            'created_at' => $row->created_at?->toIso8601String(),
            'updated_at' => $row->updated_at?->toIso8601String(),
        ]);

        return Inertia::render('fund-details', [
            'funds' => $funds,
        ]);
    }
}
