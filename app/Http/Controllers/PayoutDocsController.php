<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PayoutDocsController extends Controller
{
    /**
     * Merchant documentation: create payout (withdrawal) API.
     */
    public function __invoke(): Response
    {
        return Inertia::render('docs/payout-payment-orders', [
            'payoutEndpoint' => url('/v1/payout'),
        ]);
    }
}
