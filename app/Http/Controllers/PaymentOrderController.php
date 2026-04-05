<?php

namespace App\Http\Controllers;

use App\Models\PaymentOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentOrderController extends Controller
{
    /**
     * Display a listing of payment orders.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = PaymentOrder::query()->orderByDesc('created_at');

        if (! $user->isAdmin()) {
            if ($user->merchant_id !== null) {
                $query->where('merchant_id', $user->merchant_id);
            } else {
                $query->whereRaw('0 = 1');
            }
        }

        $orders = $query->paginate(15)->through(fn (PaymentOrder $order) => [
            'id' => $order->id,
            'merchant_id' => $order->merchant_id,
            'transaction_id' => $order->transaction_id,
            'amount' => $order->amount,
            'usdt_wallet_address' => $order->usdt_wallet_address,
            'bank_name' => $order->bank_name,
            'account_holder' => $order->account_holder,
            'account_number' => $order->account_number,
            'ifsc_code' => $order->ifsc_code,
            'status' => $order->status->value,
            'created_at' => $order->created_at?->toIso8601String(),
            'updated_at' => $order->updated_at?->toIso8601String(),
        ]);

        return Inertia::render('payment-orders', [
            'orders' => $orders,
        ]);
    }
}
