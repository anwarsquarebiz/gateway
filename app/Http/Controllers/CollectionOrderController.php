<?php

namespace App\Http\Controllers;

use App\Models\CollectionOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectionOrderController extends Controller
{
    /**
     * Display a listing of collection orders.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = CollectionOrder::query()->orderByDesc('created_at');

        if (! $user->isAdmin()) {
            if ($user->merchant_id !== null) {
                $query->where('merchant_id', $user->merchant_id);
            } else {
                $query->whereRaw('0 = 1');
            }
        }

        $orders = $query->paginate(15)->through(fn (CollectionOrder $order) => [
            'id' => $order->id,
            'merchant_id' => $order->merchant_id,
            'order_no' => $order->order_no,
            'merchant_order_no' => $order->merchant_order_no,
            'payment_type' => $order->payment_type?->value ?? null,
            'receiving_upi_id' => $order->receiving_upi_id,
            'receiving_usdt_address' => $order->receiving_usdt_address,
            'nowpayments_payment_id' => $order->nowpayments_payment_id,
            'nowpayments_pay_amount' => $order->nowpayments_pay_amount,
            'nowpayments_pay_currency' => $order->nowpayments_pay_currency,
            'amount' => $order->amount,
            'fee' => $order->fee,
            'final_amount' => $order->final_amount,
            'status' => $order->status->value,
            'callback_status' => $order->callback_status,
            'created_at' => $order->created_at?->toIso8601String(),
            'updated_at' => $order->updated_at?->toIso8601String(),
        ]);

        return Inertia::render('collection-orders', [
            'orders' => $orders,
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
