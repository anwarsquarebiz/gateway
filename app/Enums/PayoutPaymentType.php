<?php

namespace App\Enums;

enum PayoutPaymentType: string
{
    case Inr = 'inr';
    case Usdt = 'usdt';
    case Upi = 'upi';
}
