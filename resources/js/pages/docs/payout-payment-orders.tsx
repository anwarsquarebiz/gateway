import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Payout API', href: '/payout' }];

interface PayoutDocsProps {
    payoutEndpoint: string;
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="bg-muted border-border overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
            <code>{children}</code>
        </pre>
    );
}

export default function PayoutPaymentOrdersDocs({ payoutEndpoint }: PayoutDocsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payout API" />
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pb-10">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Payout API</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Submit a withdrawal (payout) request from your server. Required body fields depend on{' '}
                        <code className="bg-muted rounded px-1">payment_type</code> (<code>inr</code> bank transfer,{' '}
                        <code>usdt</code> wallet, or <code>upi</code> with a UPI id). The gateway notifies your{' '}
                        <code className="bg-muted rounded px-1">callback_url</code> when the payout is marked successful or failed.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Endpoint</CardTitle>
                        <CardDescription>JSON body. Rate limit: 120 requests per minute per IP.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Method:</span>{' '}
                            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">POST</code>
                        </p>
                        <CodeBlock>{payoutEndpoint}</CodeBlock>
                        <p className="text-muted-foreground text-xs">
                            Example path: <code className="bg-muted rounded px-1">/v1/payout</code> (same host as this app).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                        <CardDescription>
                            Identify your merchant with <code className="bg-muted rounded px-1">merchant_id</code> and prove the
                            request with an MD5 <code className="bg-muted rounded px-1">signature</code> built using your payout API
                            key (dashboard → API keys). The payout API key is never sent in the JSON body.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Request body</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-border border-b">
                                        <th className="py-2 pr-4 font-medium">Field</th>
                                        <th className="py-2 pr-4 font-medium">Required</th>
                                        <th className="py-2 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">merchant_id</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Your numeric merchant ID</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">payment_type</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">
                                            <code className="text-foreground">inr</code>, <code className="text-foreground">usdt</code>, or{' '}
                                            <code className="text-foreground">upi</code> (case-insensitive)
                                        </td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">amount</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">
                                            Gross payout amount (minimum 0.01). Fee is deducted using your payout fee percent; net
                                            credited is <code className="text-foreground">amount - fee</code> (<code className="text-foreground">final_amount</code> /{' '}
                                            <code className="text-foreground">total_amount</code>).
                                        </td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">transaction_id</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Unique idempotency key from your system (max 128 chars), globally unique</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">callback_url</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">HTTPS URL for payout status callbacks</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">signature</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">32-character MD5 hex (see below)</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs" colSpan={3}>
                                            <span className="text-foreground font-medium">If payment_type is inr</span>
                                        </td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">account_number</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Beneficiary account number</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">ifsc</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Bank IFSC</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">name</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Beneficiary account holder name</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">bank_name</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Beneficiary bank name</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs" colSpan={3}>
                                            <span className="text-foreground font-medium">If payment_type is usdt</span>
                                        </td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">usdt_wallet_address</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Destination USDT wallet address</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs" colSpan={3}>
                                            <span className="text-foreground font-medium">If payment_type is upi</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-mono text-xs">upi_id</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Beneficiary UPI ID (e.g. user@paytm)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-muted-foreground mt-3 text-xs">
                            Do not send fields for another payout type (e.g. no bank fields on <code>usdt</code> or <code>upi</code>);
                            extra keys are rejected.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Signature</CardTitle>
                        <CardDescription>
                            Canonical string from the same fields you send (except <code className="bg-muted rounded px-1">signature</code>
                            ), sorted by key, then append your payout API key.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <ol className="text-muted-foreground list-inside list-decimal space-y-2">
                            <li>
                                Always include: <code className="bg-muted rounded px-1">merchant_id</code>,{' '}
                                <code className="bg-muted rounded px-1">payment_type</code>,{' '}
                                <code className="bg-muted rounded px-1">amount</code> (2 decimal places as string),{' '}
                                <code className="bg-muted rounded px-1">transaction_id</code>,{' '}
                                <code className="bg-muted rounded px-1">callback_url</code>.
                            </li>
                            <li>
                                For <code className="bg-muted rounded px-1">inr</code>, also include:{' '}
                                <code className="bg-muted rounded px-1">account_number</code>, <code className="bg-muted rounded px-1">ifsc</code>,{' '}
                                <code className="bg-muted rounded px-1">name</code>, <code className="bg-muted rounded px-1">bank_name</code>.
                            </li>
                            <li>
                                For <code className="bg-muted rounded px-1">usdt</code>, also include:{' '}
                                <code className="bg-muted rounded px-1">usdt_wallet_address</code>.
                            </li>
                            <li>
                                For <code className="bg-muted rounded px-1">upi</code>, also include:{' '}
                                <code className="bg-muted rounded px-1">upi_id</code>.
                            </li>
                            <li>Remove keys whose value is empty after trim.</li>
                            <li>Sort parameters by key (ASCII), join as <code className="bg-muted rounded px-1">key=value&amp;</code>, then append{' '}
                                <code className="bg-muted rounded px-1">key=YOUR_PAYOUT_API_KEY</code>.
                            </li>
                            <li>MD5 the full string; send lowercase hex in <code className="bg-muted rounded px-1">signature</code>.</li>
                        </ol>
                        <CodeBlock>{`INR example (before MD5):
account_number=1234567890&amount=150.00&bank_name=HDFC Bank&callback_url=https://merchant.example.com/payout-callback&ifsc=HDFC0001234&merchant_id=100555001&name=Rahul Kumar&payment_type=inr&transaction_id=WD_1761272941&key=pk_your_payout_api_key`}</CodeBlock>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Success response</CardTitle>
                        <CardDescription>HTTP 200</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock>{`{
  "status": "success",
  "message": "Withdrawal request received",
  "data": {
    "transaction_id": "WD_1761272941",
    "amount": 150,
    "fee": 5.25,
    "final_amount": 144.75,
    "total_amount": 144.75
  }
}`}</CodeBlock>
                        <p className="text-muted-foreground mt-2 text-xs">
                            <code className="text-foreground">fee</code> is computed from your merchant payout fee percent.{' '}
                            <code className="text-foreground">final_amount</code> is <code className="text-foreground">amount - fee</code>{' '}
                            (net payout). <code className="text-foreground">total_amount</code> is the same final net amount.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Error responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-muted-foreground space-y-2 text-sm">
                            <li>
                                <code className="text-foreground">422</code> — validation; body includes{' '}
                                <code className="bg-muted rounded px-1">status: &quot;error&quot;</code> and <code className="bg-muted rounded px-1">message</code>.
                            </li>
                            <li>
                                <code className="text-foreground">400</code> — invalid merchant, invalid signature, or duplicate{' '}
                                <code className="bg-muted rounded px-1">transaction_id</code>.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Merchant callback</CardTitle>
                        <CardDescription>
                            When a payout order moves to terminal <code className="bg-muted rounded px-1">success</code> or{' '}
                            <code className="bg-muted rounded px-1">failed</code> status, the gateway POSTs JSON to your{' '}
                            <code className="bg-muted rounded px-1">callback_url</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Respond with HTTP 2xx to acknowledge. <code className="text-foreground">amount</code> is the net payout (
                            <code className="text-foreground">final_amount</code>) as a string with 2 decimals;{' '}
                            <code className="text-foreground">status</code> is uppercase.
                        </p>
                        <CodeBlock>{`{
  "merchant_id": 100555001,
  "transaction_id": "WD_1764208563",
  "amount": "144.75",
  "status": "SUCCESS",
  "timestamp": "2025-11-27 07:27:14"
}`}</CodeBlock>
                        <CodeBlock>{`{
  "merchant_id": 100555001,
  "transaction_id": "WD_1764208563",
  "amount": "144.75",
  "status": "FAILED",
  "timestamp": "2025-11-27 07:27:58"
}`}</CodeBlock>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
