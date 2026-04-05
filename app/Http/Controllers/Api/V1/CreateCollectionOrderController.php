<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CollectionOrderStatus;
use App\Enums\CollectionPaymentType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\CollectionOrder;
use App\Models\User;
use App\Support\AdminReceivingRoundRobin;
use App\Support\NowPayments\NowPaymentsClient;
use App\Support\NowPayments\NowPaymentsException;
use App\Support\PayinRequestSignature;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateCollectionOrderController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->json()->all();

        $validator = Validator::make($data, [
            'merchant_id' => ['required'],
            'api_key' => ['required', 'string', 'max:80'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'merchant_order_no' => ['required', 'string', 'max:128'],
            'callback_url' => ['required', 'string', 'max:2048', 'url'],
            'payment_type' => ['required', 'string', Rule::in(array_map(fn (CollectionPaymentType $t) => $t->value, CollectionPaymentType::cases()))],
            'extra' => ['nullable', 'string', 'max:65535'],
            'signature' => ['required', 'string', 'size:32', 'regex:/^[a-fA-F0-9]{32}$/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        /** @var array{merchant_id: mixed, api_key: string, amount: numeric-string|float|int, merchant_order_no: string, callback_url: string, payment_type: string, extra?: string|null, signature: string} $validated */
        $validated = $validator->validated();

        $merchantId = filter_var($validated['merchant_id'], FILTER_VALIDATE_INT);
        if ($merchantId === false || $merchantId < 1) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid merchant',
            ], 400);
        }

        $user = User::query()
            ->where('merchant_id', $merchantId)
            ->where('payin_api_key', $validated['api_key'])
            ->where('role', UserRole::Merchant)
            ->first();

        if ($user === null) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid merchant',
            ], 400);
        }

        if (! PayinRequestSignature::verify($validated, $validated['api_key'], $validated['signature'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature',
            ], 400);
        }

        $paymentType = CollectionPaymentType::from($validated['payment_type']);

        if (CollectionOrder::query()
            ->where('merchant_id', $merchantId)
            ->where('merchant_order_no', $validated['merchant_order_no'])
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Order already exists',
            ], 400);
        }

        $amount = number_format((float) $validated['amount'], 2, '.', '');
        $feePercent = (float) $user->payin_fee_percent;
        $fee = number_format(round((float) $amount * $feePercent / 100, 2), 2, '.', '');
        $finalAmount = number_format(round((float) $amount - (float) $fee, 2), 2, '.', '');

        try {
            $order = DB::transaction(function () use ($merchantId, $amount, $fee, $finalAmount, $validated, $paymentType) {
                $prefix = 'GW'.now()->format('Ymd');

                $lastOrderNo = CollectionOrder::query()
                    ->where('order_no', 'like', $prefix.'%')
                    ->lockForUpdate()
                    ->orderByDesc('order_no')
                    ->value('order_no');

                $nextSeq = 1;
                if (is_string($lastOrderNo) && str_starts_with($lastOrderNo, $prefix)) {
                    $suffix = substr($lastOrderNo, strlen($prefix));
                    $nextSeq = (int) $suffix + 1;
                }

                $orderNo = $prefix.str_pad((string) $nextSeq, 4, '0', STR_PAD_LEFT);

                $adminUpiId = null;
                $adminUsdtAddressId = null;
                $receivingUpiId = null;
                $receivingUsdtAddress = null;

                if ($paymentType === CollectionPaymentType::Inr) {
                    $upi = AdminReceivingRoundRobin::nextAdminUpi();
                    if ($upi === null) {
                        throw new \RuntimeException('No UPI receiving endpoints are configured.');
                    }
                    $adminUpiId = $upi->id;
                    $receivingUpiId = $upi->upi_id;
                }

                return CollectionOrder::query()->create([
                    'merchant_id' => $merchantId,
                    'order_no' => $orderNo,
                    'merchant_order_no' => $validated['merchant_order_no'],
                    'payment_type' => $paymentType,
                    'admin_upi_id' => $adminUpiId,
                    'admin_usdt_address_id' => $adminUsdtAddressId,
                    'receiving_upi_id' => $receivingUpiId,
                    'receiving_usdt_address' => $receivingUsdtAddress,
                    'amount' => $amount,
                    'fee' => $fee,
                    'final_amount' => $finalAmount,
                    'status' => CollectionOrderStatus::Created,
                    'callback_status' => 'pending',
                    'callback_url' => $validated['callback_url'],
                    'extra' => $validated['extra'] ?? null,
                ]);
            });
        } catch (QueryException $e) {
            if (str_contains(strtolower($e->getMessage()), 'unique')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order already exists',
                ], 400);
            }

            throw $e;
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        if ($paymentType === CollectionPaymentType::Usdt) {
            $client = app(NowPaymentsClient::class);
            if (! $client->isConfigured()) {
                $order->delete();

                return response()->json([
                    'success' => false,
                    'message' => 'USDT payments are not configured (NOWPayments API key missing).',
                ], 503);
            }

            try {
                $np = $client->createPaymentForCollectionOrder($order);
                $order->update([
                    'receiving_usdt_address' => $np['pay_address'],
                    'nowpayments_payment_id' => $np['payment_id'],
                    'nowpayments_pay_amount' => $np['pay_amount'] !== null ? (string) $np['pay_amount'] : null,
                    'nowpayments_pay_currency' => $np['pay_currency'],
                ]);
            } catch (NowPaymentsException $e) {
                $order->delete();

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 502);
            }
        }

        $order->refresh();

        $paymentUrl = url('/pay/'.$order->order_no);

        return response()->json([
            'success' => true,
            'merchant_order_no' => $order->merchant_order_no,
            'order_no' => $order->order_no,
            'amount' => (string) $order->amount,
            'payment_type' => $order->payment_type?->value,
            'receiving_upi_id' => $order->receiving_upi_id,
            'receiving_usdt_address' => $order->receiving_usdt_address,
            'nowpayments_payment_id' => $order->nowpayments_payment_id,
            'nowpayments_pay_amount' => $order->nowpayments_pay_amount,
            'nowpayments_pay_currency' => $order->nowpayments_pay_currency,
            'payment_url' => $paymentUrl,
            'status' => $order->status->value,
        ], 201);
    }
}
