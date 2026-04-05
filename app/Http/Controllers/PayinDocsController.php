<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PayinDocsController extends Controller
{
    /**
     * Merchant documentation: create collection order (payin) API.
     */
    public function __invoke(): Response
    {
        return Inertia::render('docs/payin-collection-orders', [
            'createEndpoint' => url('/v1/create'),
            'payBaseUrl' => url('/pay'),
        ]);
    }
}
