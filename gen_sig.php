<?php

$merchant_id = '100555093';
$api_key = 'pk_8270a036557732def751aba2c58c24c1279276ed58ee7b47';

$amount = number_format(1000, 2, '.', '');
$merchant_order_no = 'ORD20250211';
$callback_url = 'https://site.com/callback';
$payment_type = 'usdt';

$params = [
    'merchant_id' => $merchant_id,
    'amount' => $amount,
    'merchant_order_no' => $merchant_order_no,
    'callback_url' => $callback_url,
    'payment_type' => $payment_type,
];

$params = array_filter($params);
ksort($params);

$signStr = '';

foreach ($params as $k => $v) {
    $signStr .= $k.'='.$v.'&';
}

$signStr .= 'key='.$api_key;

$signature = md5($signStr);

echo $signature;
