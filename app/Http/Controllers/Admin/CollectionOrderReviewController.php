<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CollectionOrderStatus;
use App\Http\Controllers\Controller;
use App\Models\CollectionOrder;
use App\Services\CollectionOrderMerchantCallback;
use Illuminate\Http\RedirectResponse;

class CollectionOrderReviewController extends Controller
{
    public function accept(CollectionOrder $collectionOrder): RedirectResponse
    {
        return $this->decide($collectionOrder, CollectionOrderStatus::Success);
    }

    public function reject(CollectionOrder $collectionOrder): RedirectResponse
    {
        return $this->decide($collectionOrder, CollectionOrderStatus::Failed);
    }

    private function decide(CollectionOrder $order, CollectionOrderStatus $newStatus): RedirectResponse
    {
        if (! in_array($order->status, [CollectionOrderStatus::Created, CollectionOrderStatus::Submitted], true)) {
            return redirect()->route('collection-orders')->withErrors([
                'review' => 'Only open orders (created or submitted) can be accepted or rejected.',
            ]);
        }

        $order->update(['status' => $newStatus]);

        $callbackStatus = $newStatus === CollectionOrderStatus::Success ? 'success' : 'failed';
        app(CollectionOrderMerchantCallback::class)->dispatch($order->fresh(), $callbackStatus);

        $flash = $newStatus === CollectionOrderStatus::Success ? 'collection-order-accepted' : 'collection-order-rejected';

        return redirect()->route('collection-orders')->with('status', $flash);
    }
}
