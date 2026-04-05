<?php

namespace App\Providers;

use App\Models\PaymentOrder;
use App\Observers\PaymentOrderObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        PaymentOrder::observe(PaymentOrderObserver::class);
    }
}
