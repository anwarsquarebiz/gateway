<?php

namespace App\Http\Controllers;

use App\Enums\CollectionOrderStatus;
use App\Enums\CollectionPaymentType;
use App\Models\CollectionOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubmitPayOrderUtrController extends Controller
{
    public function __invoke(Request $request, string $order_no): RedirectResponse
    {
        $order = CollectionOrder::query()->where('order_no', $order_no)->firstOrFail();

        if ($order->status !== CollectionOrderStatus::Created) {
            return redirect()
                ->route('pay.show', $order_no)
                ->withErrors(['utr' => 'This order cannot accept a UTR anymore.']);
        }

        if ($order->payment_type !== CollectionPaymentType::Inr) {
            return redirect()
                ->route('pay.show', $order_no)
                ->withErrors(['utr' => 'UTR applies only to UPI (INR) payments.']);
        }

        $validated = $request->validate([
            'utr' => ['required', 'string', 'regex:/^\d{12}$/'],
        ]);

        $order->update([
            'payment_reference_id' => $validated['utr'],
            'status' => CollectionOrderStatus::Submitted,
        ]);

        return redirect()
            ->route('pay.show', $order_no)
            ->with('utr_submitted', true);
    }
}
