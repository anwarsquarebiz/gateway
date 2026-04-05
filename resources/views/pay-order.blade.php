<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>
        @if($order->payment_type?->value === 'inr')
            UPI Payment — {{ $order->order_no }}
        @elseif($order->payment_type?->value === 'usdt')
            USDT Payment — {{ $order->order_no }}
        @else
            Pay {{ $order->order_no }}
        @endif
    </title>
    <style>
        :root {
            --bg: #f4f4f5;
            --card: #ffffff;
            --border: #e4e4e7;
            --text: #18181b;
            --muted: #71717a;
            --primary: #18181b;
            --radius: 12px;
        }
        * { box-sizing: border-box; }
        body {
            font-family: ui-sans-serif, system-ui, sans-serif;
            margin: 0;
            min-height: 100vh;
            background: var(--bg);
            color: var(--text);
            padding: 1.25rem;
        }
        .wrap { max-width: 22rem; margin: 0 auto; }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 1.25rem 1.25rem 1.5rem;
            box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
        }
        .title {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.02em;
        }
        .amount {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0.75rem 0 0;
            letter-spacing: -0.03em;
        }
        .muted { color: var(--muted); font-size: 0.8125rem; margin-top: 0.35rem; }
        .section {
            margin-top: 1.25rem;
            padding-top: 1.25rem;
            border-top: 1px solid var(--border);
        }
        .section-label {
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--muted);
            margin-bottom: 0.75rem;
        }
        .timer-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }
        .timer {
            font-variant-numeric: tabular-nums;
            font-weight: 700;
            font-size: 1.125rem;
            font-family: ui-monospace, monospace;
        }
        .scan-hint { font-size: 0.875rem; color: var(--muted); margin: 0 0 1rem; line-height: 1.45; }
        .qr-wrap {
            display: flex;
            justify-content: center;
            padding: 0.5rem 0 0.25rem;
        }
        .qr-wrap img {
            width: 220px;
            height: 220px;
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        .apps {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .app-btn {
            display: block;
            text-align: center;
            padding: 0.65rem 1rem;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: #fafafa;
            color: var(--text);
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
        }
        .app-btn:active { background: #f4f4f5; }
        .manual-steps { font-size: 0.8125rem; color: var(--muted); margin: 0 0 0.75rem; padding-left: 1.1rem; }
        .manual-steps li { margin-bottom: 0.35rem; }
        .copy-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        .upi-pill {
            flex: 1;
            min-width: 0;
            font-family: ui-monospace, monospace;
            font-size: 0.75rem;
            padding: 0.5rem 0.65rem;
            background: #fafafa;
            border: 1px solid var(--border);
            border-radius: 8px;
            word-break: break-all;
        }
        button.copy-btn {
            flex-shrink: 0;
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem;
            font-weight: 500;
            border-radius: 8px;
            border: 1px solid var(--primary);
            background: var(--primary);
            color: #fff;
            cursor: pointer;
        }
        button.copy-btn.copied { background: #22c55e; border-color: #22c55e; }
        .utr-form {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .utr-form input {
            width: 100%;
            padding: 0.6rem 0.75rem;
            font-size: 1rem;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.05em;
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        .utr-form input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgb(24 24 27 / 0.08);
        }
        button.submit-btn {
            padding: 0.65rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            background: var(--primary);
            color: #fff;
            cursor: pointer;
        }
        button.submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .alert {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        .alert.ok { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert.err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .mono { font-family: ui-monospace, monospace; }
        .footer-meta { margin-top: 1rem; font-size: 0.75rem; color: var(--muted); }
        .addr-box {
            font-size: 0.75rem;
            word-break: break-all;
            padding: 0.65rem 0.75rem;
            background: #fafafa;
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="wrap">
        @if(session('utr_submitted'))
            <div class="alert ok">Your UTR has been submitted. We will verify your payment shortly.</div>
        @endif

        @if($errors->has('utr'))
            <div class="alert err">{{ $errors->first('utr') }}</div>
        @endif

        @php
            $isInr = $order->payment_type?->value === 'inr';
            $isUsdt = $order->payment_type?->value === 'usdt';
            $statusVal = $order->status->value;
            $isCreated = $statusVal === 'created';
            $isSubmitted = $statusVal === 'submitted';
        @endphp

        <div class="card">
            @if($isInr)
                <h1 class="title">UPI Payment</h1>
            @elseif($isUsdt)
                <h1 class="title">USDT Payment</h1>
            @else
                <h1 class="title">Payment</h1>
            @endif

            <p class="amount">
                @if($isInr)
                    ₹{{ number_format((float) $order->amount, 2, '.', '') }}
                @elseif($isUsdt)
                    {{ number_format((float) $order->amount, 2, '.', '') }} <span style="font-size:1rem;font-weight:600">USDT</span>
                @else
                    {{ $order->amount }}
                @endif
            </p>
            <p class="muted">Order <span class="mono">{{ $order->order_no }}</span></p>

            @if($isInr && $isCreated && $upiIntents)
                <div class="section">
                    <div class="timer-row">
                        <span class="muted" style="margin:0;font-size:0.8125rem">Pay within</span>
                        <span class="timer" id="pay-timer">15:00</span>
                    </div>
                    <p class="scan-hint">Use Mobile Scan code to pay</p>
                    <div class="qr-wrap">
                        <img src="{{ $upiIntents['qr_image_url'] }}" width="220" height="220" alt="UPI QR code">
                    </div>
                </div>

                <div class="section">
                    <div class="section-label">Pay with app</div>
                    <div class="apps">
                        <a class="app-btn" href="{{ $upiIntents['paytm'] }}">Paytm</a>
                        <a class="app-btn" href="{{ $upiIntents['phonepe'] }}">PhonePe</a>
                        <a class="app-btn" href="{{ $upiIntents['upi_pay'] }}">Other UPI</a>
                    </div>
                </div>

                <div class="section">
                    <div class="section-label">Manual transfer</div>
                    <ol class="manual-steps">
                        <li>Copy the below given UPI</li>
                        <li>Need to enter your 12 digit Ref No (UTR) — Submit</li>
                    </ol>
                    <div class="copy-row">
                        <div class="upi-pill" id="upi-text">{{ $order->receiving_upi_id }}</div>
                        <button type="button" class="copy-btn" id="copy-upi" data-copy="{{ $order->receiving_upi_id }}">Copy</button>
                    </div>
                    <form class="utr-form" method="post" action="{{ route('pay.utr', $order->order_no) }}">
                        @csrf
                        <input
                            type="text"
                            name="utr"
                            inputmode="numeric"
                            pattern="[0-9]{12}"
                            maxlength="12"
                            placeholder="12 digit UTR"
                            required
                            autocomplete="off"
                            aria-label="12 digit UTR reference number"
                        >
                        <button type="submit" class="submit-btn">Submit</button>
                    </form>
                </div>
            @elseif($isInr && $isCreated && ! $upiIntents)
                <div class="section">
                    <p class="muted" style="margin:0">UPI payment could not be loaded. Please contact support with your order number.</p>
                </div>
            @elseif($isUsdt && $isCreated && ! $order->receiving_usdt_address)
                <div class="section">
                    <p class="muted" style="margin:0">USDT receiving address could not be loaded. Please contact support with your order number.</p>
                </div>
            @elseif($isUsdt && $isCreated && $order->receiving_usdt_address && $usdtQrImageUrl)
                <div class="section">
                    <div class="timer-row">
                        <span class="muted" style="margin:0;font-size:0.8125rem">Complete within</span>
                        <span class="timer" id="usdt-timer">1:00:00</span>
                    </div>
                    <p class="scan-hint">Scan with your crypto wallet. This deposit address is created by NOWPayments for this order.</p>
                    <div class="qr-wrap">
                        <img src="{{ $usdtQrImageUrl }}" width="220" height="220" alt="USDT address QR code">
                    </div>
                </div>

                <div class="section">
                    <div class="section-label">Send USDT to</div>
                    <div class="addr-box mono">{{ $order->receiving_usdt_address }}</div>
                    <div class="copy-row">
                        <button type="button" class="copy-btn" style="width:100%" id="copy-usdt" data-copy="{{ $order->receiving_usdt_address }}">Copy address</button>
                    </div>
                    <p class="muted" style="margin:0">Order amount: <strong>{{ number_format((float) $order->amount, 2, '.', '') }} USDT</strong>. Send from a wallet you control; use the network that matches this address.</p>
                    @if($order->nowpayments_pay_amount)
                        <p class="muted" style="margin-top:0.5rem;font-size:0.75rem">
                            NOWPayments amount:
                            <span class="mono">{{ $order->nowpayments_pay_amount }} {{ strtoupper($order->nowpayments_pay_currency ?? '') }}</span>
                            @if($order->nowpayments_pay_currency)
                                — if your wallet shows this exact due amount, prefer it for settlement.
                            @endif
                        </p>
                    @endif
                </div>
            @elseif($isInr && $isSubmitted)
                <div class="section">
                    <p style="margin:0;font-size:0.9375rem">Payment reference (UTR) recorded.</p>
                    @if($order->payment_reference_id)
                        <p class="muted" style="margin-top:0.5rem">UTR: <span class="mono">{{ $order->payment_reference_id }}</span></p>
                    @endif
                    <p class="muted" style="margin-top:0.75rem">Status: <strong style="color:var(--text);text-transform:capitalize">{{ $order->status->value }}</strong></p>
                </div>
            @else
                <div class="section">
                    <dl style="margin:0;font-size:0.875rem;">
                        <div style="display:flex;justify-content:space-between;gap:1rem;margin-bottom:0.5rem;">
                            <dt class="muted">Status</dt>
                            <dd style="margin:0;text-transform:capitalize">{{ $order->status->value }}</dd>
                        </div>
                        @if($order->payment_reference_id)
                            <div style="display:flex;justify-content:space-between;gap:1rem;margin-bottom:0.5rem;">
                                <dt class="muted">Reference</dt>
                                <dd class="mono" style="margin:0;font-size:0.75rem;max-width:12rem;text-align:right;word-break:break-all">{{ $order->payment_reference_id }}</dd>
                            </div>
                        @endif
                    </dl>
                </div>
            @endif
        </div>

        @if($isInr && $isCreated && $upiIntents)
            <p class="footer-meta">If you closed the payment app, use your bank’s UPI app and enter the UPI ID manually.</p>
        @endif
    </div>

    @if($isInr && $isCreated && $upiIntents && $payExpiresAt)
        <script>
            (function () {
                var el = document.getElementById('pay-timer');
                var expires = new Date(@json($payExpiresAt->toIso8601String()));
                function tick() {
                    var left = Math.max(0, expires.getTime() - Date.now());
                    var m = Math.floor(left / 60000);
                    var s = Math.floor((left % 60000) / 1000);
                    if (el) {
                        el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
                    }
                }
                tick();
                setInterval(tick, 1000);
            })();
        </script>
    @endif

    @if($isUsdt && $isCreated && $usdtPayExpiresAt && $usdtQrImageUrl)
        <script>
            (function () {
                var el = document.getElementById('usdt-timer');
                var expires = new Date(@json($usdtPayExpiresAt->toIso8601String()));
                function tick() {
                    var left = Math.max(0, expires.getTime() - Date.now());
                    var h = Math.floor(left / 3600000);
                    var m = Math.floor((left % 3600000) / 60000);
                    var s = Math.floor((left % 60000) / 1000);
                    if (el) {
                        el.textContent = h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
                    }
                }
                tick();
                setInterval(tick, 1000);
            })();
        </script>
    @endif

    <script>
        (function () {
            function bindCopy(btnId) {
                var btn = document.getElementById(btnId);
                if (!btn || !btn.dataset.copy) return;
                btn.addEventListener('click', function () {
                    var text = btn.dataset.copy;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(function () {
                            var prev = btn.textContent;
                            btn.textContent = 'Copied';
                            btn.classList.add('copied');
                            setTimeout(function () {
                                btn.textContent = prev;
                                btn.classList.remove('copied');
                            }, 2000);
                        });
                    }
                });
            }
            bindCopy('copy-upi');
            bindCopy('copy-usdt');
        })();
    </script>
</body>
</html>
