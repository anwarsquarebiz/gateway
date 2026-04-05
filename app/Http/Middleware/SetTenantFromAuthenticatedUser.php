<?php

namespace App\Http\Middleware;

use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantFromAuthenticatedUser
{
    /**
     * Bind the current request's tenant (merchant) from the authenticated user.
     */
    public function handle(Request $request, Closure $next): Response
    {
        TenantContext::clear();

        if ($user = $request->user()) {
            TenantContext::setMerchantId($user->merchant_id);
        }

        return $next($request);
    }
}
