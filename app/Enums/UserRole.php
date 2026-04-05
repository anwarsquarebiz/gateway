<?php

namespace App\Enums;

enum UserRole: string
{
    case Merchant = 'merchant';
    case Broker = 'broker';
    case Admin = 'admin';
}
