<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentOrderStatus;
use App\Enums\PayoutPaymentType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\PaymentOrder;
use App\Models\User;
use App\Support\PayoutRequestSignature;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreatePayoutOrderController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->json()->all();
        if (isset($data['payment_type']) && is_string($data['payment_type'])) {
            $data['payment_type'] = strtolower(trim($data['payment_type']));
        }

        $paymentTypeRaw = (string) ($data['payment_type'] ?? '');

        $rules = [
            'merchant_id' => ['required'],
            'payment_type' => ['required', 'string', Rule::in(['inr', 'usdt', 'upi'])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_id' => ['required', 'string', 'max:128'],
            'callback_url' => ['required', 'string', 'max:2048', 'url'],
            'signature' => ['required', 'string', 'size:32', 'regex:/^[a-fA-F0-9]{32}$/'],
        ];

        if ($paymentTypeRaw === 'inr') {
            $rules['account_number'] = ['required', 'string', 'max:64'];
            $rules['ifsc'] = ['required', 'string', 'max:32'];
            $rules['name'] = ['required', 'string', 'max:255'];
            $rules['bank_name'] = ['required', 'string', 'max:128'];
            $rules['usdt_wallet_address'] = ['prohibited'];
            $rules['upi_id'] = ['prohibited'];
        } elseif ($paymentTypeRaw === 'usdt') {
            $rules['usdt_wallet_address'] = ['required', 'string', 'max:255'];
            $rules['account_number'] = ['prohibited'];
            $rules['ifsc'] = ['prohibited'];
            $rules['name'] = ['prohibited'];
            $rules['bank_name'] = ['prohibited'];
            $rules['upi_id'] = ['prohibited'];
        } elseif ($paymentTypeRaw === 'upi') {
            $rules['upi_id'] = ['required', 'string', 'max:128'];
            $rules['account_number'] = ['prohibited'];
            $rules['ifsc'] = ['prohibited'];
            $rules['name'] = ['prohibited'];
            $rules['bank_name'] = ['prohibited'];
            $rules['usdt_wallet_address'] = ['prohibited'];
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        /** @var array<string, mixed> $validated */
        $validated = $validator->validated();

        $merchantId = filter_var($validated['merchant_id'], FILTER_VALIDATE_INT);
        if ($merchantId === false || $merchantId < 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid merchant',
            ], 400);
        }

        $user = User::query()
            ->where('merchant_id', $merchantId)
            ->where('role', UserRole::Merchant)
            ->first();

        if ($user === null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid merchant',
            ], 400);
        }

        if (! PayoutRequestSignature::verify($validated, $user->payout_api_key, $validated['signature'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid signature',
            ], 400);
        }

        $paymentType = PayoutPaymentType::from($validated['payment_type']);

        if (PaymentOrder::query()->where('transaction_id', $validated['transaction_id'])->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction already exists',
            ], 400);
        }

        $amount = number_format((float) $validated['amount'], 2, '.', '');
        $feePercent = (float) $user->payout_fee_percent;
        $fee = number_format(round((float) $amount * $feePercent / 100, 2), 2, '.', '');
        $finalAmount = number_format(round((float) $amount - (float) $fee, 2), 2, '.', '');
        $totalAmount = $finalAmount;

        $usdtWallet = '';
        $bankName = '';
        $accountHolder = '';
        $accountNumber = '';
        $ifscCode = '';
        $upiId = '';

        if ($paymentType === PayoutPaymentType::Inr) {
            $bankName = $validated['bank_name'];
            $accountHolder = $validated['name'];
            $accountNumber = $validated['account_number'];
            $ifscCode = $validated['ifsc'];
        } elseif ($paymentType === PayoutPaymentType::Usdt) {
            $usdtWallet = $validated['usdt_wallet_address'];
        } else {
            $upiId = $validated['upi_id'];
        }

        try {
            $order = PaymentOrder::query()->create([
                'merchant_id' => $merchantId,
                'transaction_id' => $validated['transaction_id'],
                'payment_type' => $paymentType,
                'amount' => $amount,
                'fee' => $fee,
                'final_amount' => $finalAmount,
                'total_amount' => $totalAmount,
                'usdt_wallet_address' => $usdtWallet,
                'bank_name' => $bankName,
                'account_holder' => $accountHolder,
                'account_number' => $accountNumber,
                'ifsc_code' => $ifscCode,
                'upi_id' => $upiId,
                'callback_url' => $validated['callback_url'],
                'status' => PaymentOrderStatus::Pending,
                'callback_status' => 'pending',
            ]);
        } catch (QueryException $e) {
            if (str_contains(strtolower($e->getMessage()), 'unique')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Transaction already exists',
                ], 400);
            }

            throw $e;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal request received',
            'data' => [
                'transaction_id' => $order->transaction_id,
                'amount' => round((float) $order->amount, 2),
                'fee' => round((float) $order->fee, 2),
                'final_amount' => round((float) $order->final_amount, 2),
                'total_amount' => round((float) $order->total_amount, 2),
            ],
        ], 200);
    }
}
