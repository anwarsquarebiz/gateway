<?php

namespace App\Enums;

enum CollectionOrderStatus: string
{
    case Created = 'created';
    case Submitted = 'submitted';
    case Success = 'success';
    case Failed = 'failed';
}
