<?php

namespace App\Enums;

enum PaymentOrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Success = 'success';
    case Failed = 'failed';
}
