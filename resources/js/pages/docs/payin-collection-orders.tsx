import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Collection orders (Payin)', href: '/payin' }];

interface PayinDocsProps {
    createEndpoint: string;
    payBaseUrl: string;
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="bg-muted border-border overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
            <code>{children}</code>
        </pre>
    );
}

export default function PayinCollectionOrdersDocs({ createEndpoint, payBaseUrl }: PayinDocsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collection orders API (Payin)" />
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pb-10">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Collection orders API (Payin)</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Create a pay-in (collection) order from your server. Customers complete payment at the gateway pay
                        URL. Your system receives status updates via the callback URL you provide.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Endpoint</CardTitle>
                        <CardDescription>JSON body. Rate limit: 120 requests per minute per IP.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Method:</span> <code className="bg-muted rounded px-1.5 py-0.5 text-xs">POST</code>
                        </p>
                        <CodeBlock>{createEndpoint}</CodeBlock>
                        <p className="text-muted-foreground text-xs">
                            Use your app base URL in production (same host as this dashboard). Example path:{' '}
                            <code className="bg-muted rounded px-1">/v1/create</code>.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                        <CardDescription>Every request must include your merchant id and payin API key.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <ul className="text-muted-foreground list-inside list-disc space-y-1">
                            <li>
                                <span className="text-foreground font-medium">merchant_id</span> — your numeric merchant ID
                            </li>
                            <li>
                                <span className="text-foreground font-medium">api_key</span> — your payin API key (dashboard →
                                API keys)
                            </li>
                            <li>
                                <span className="text-foreground font-medium">signature</span> — MD5 hex (32 chars), see below
                            </li>
                        </ul>
                    </CardContent>
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
                                        <td className="py-2">Integer merchant id</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">api_key</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Payin API key</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">amount</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Decimal amount (min 0.01). Fees apply on top of pricing rules.</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">merchant_order_no</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">Your unique reference (max 128 chars), unique per merchant</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">callback_url</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">HTTPS URL for server-to-server callbacks (see below)</td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">payment_type</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">
                                            <code className="text-foreground">inr</code> (UPI) or{' '}
                                            <code className="text-foreground">usdt</code> (crypto via NOWPayments)
                                        </td>
                                    </tr>
                                    <tr className="border-border/60 border-b">
                                        <td className="py-2 pr-4 font-mono text-xs">extra</td>
                                        <td className="py-2 pr-4">No</td>
                                        <td className="py-2">Optional opaque string stored with the order</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-mono text-xs">signature</td>
                                        <td className="py-2 pr-4">Yes</td>
                                        <td className="py-2">32-character lowercase MD5 hex</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Signature</CardTitle>
                        <CardDescription>
                            Build a canonical string from five fields (amount formatted to 2 decimals), sort by key, append
                            the secret, then MD5.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <ol className="text-muted-foreground list-inside list-decimal space-y-2">
                            <li>
                                Include: <code className="bg-muted rounded px-1">merchant_id</code>,{' '}
                                <code className="bg-muted rounded px-1">amount</code> (as string with 2 decimals),{' '}
                                <code className="bg-muted rounded px-1">merchant_order_no</code>,{' '}
                                <code className="bg-muted rounded px-1">callback_url</code>,{' '}
                                <code className="bg-muted rounded px-1">payment_type</code> (<code>inr</code> or{' '}
                                <code>usdt</code>).
                            </li>
                            <li>Drop any field whose value is an empty string after trim.</li>
                            <li>Sort parameters by key (ASCII).</li>
                            <li>
                                Concatenate as <code className="bg-muted rounded px-1">key=value&amp;</code> for each pair,
                                then append <code className="bg-muted rounded px-1">key=YOUR_PAYIN_API_KEY</code>.
                            </li>
                            <li>MD5 the full string and send as lowercase hex in <code className="bg-muted rounded px-1">signature</code>.</li>
                        </ol>
                        <p className="text-muted-foreground text-xs">Verification uses the same payin API key you send in api_key.</p>
                        <CodeBlock>{`Example string shape (before MD5):
amount=1000.00&callback_url=https://merchant.example/hook&merchant_id=100555093&merchant_order_no=ORD001&payment_type=inr&key=pk_your_payin_api_key_here`}</CodeBlock>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Success response</CardTitle>
                        <CardDescription>HTTP 201</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <CodeBlock>{`{
  "success": true,
  "merchant_order_no": "ORD20250201",
  "order_no": "GW202504040001",
  "amount": "1000.00",
  "payment_type": "inr",
  "receiving_upi_id": "merchant@upi",
  "receiving_usdt_address": null,
  "nowpayments_payment_id": null,
  "nowpayments_pay_amount": null,
  "nowpayments_pay_currency": null,
  "payment_url": "${payBaseUrl}/GW202504040001",
  "status": "created"
}`}</CodeBlock>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
                            <li>
                                <span className="text-foreground">payment_url</span> — send your customer here to pay.
                            </li>
                            <li>
                                For <code className="bg-muted rounded px-1">inr</code>, <code className="bg-muted rounded px-1">receiving_upi_id</code> is set.
                            </li>
                            <li>
                                For <code className="bg-muted rounded px-1">usdt</code>, NOWPayments fields and deposit address are filled when configured.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Error responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-muted-foreground space-y-2 text-sm">
                            <li>
                                <code className="text-foreground">422</code> — validation error; <code className="bg-muted rounded px-1">message</code> explains the first error.
                            </li>
                            <li>
                                <code className="text-foreground">400</code> — invalid merchant, invalid signature, or duplicate{' '}
                                <code className="bg-muted rounded px-1">merchant_order_no</code>.
                            </li>
                            <li>
                                <code className="text-foreground">502/503</code> — USDT path: NOWPayments misconfiguration or API error (order is not created).
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Merchant callback</CardTitle>
                        <CardDescription>
                            When an admin approves or rejects an eligible order, the gateway POSTs JSON to your{' '}
                            <code className="bg-muted rounded px-1">callback_url</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Content-Type: application/json (typical). Your endpoint should return HTTP 2xx to acknowledge delivery.
                        </p>
                        <CodeBlock>{`{
  "orderNo": "GW202504040001",
  "merchantOrder": "ORD20250201",
  "status": "success",
  "amount": 1000
}`}</CodeBlock>
                        <p className="text-muted-foreground text-xs">
                            <code className="text-foreground">status</code> is <code className="bg-muted rounded px-1">success</code> or{' '}
                            <code className="bg-muted rounded px-1">failed</code>. <code className="text-foreground">amount</code> is a
                            number (your order amount field).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-2 text-sm">
                        <p>
                            <span className="text-foreground font-medium">INR:</span> UPI receiving IDs are rotated from the
                            admin-configured pool. Customer may submit UTR on the pay page; admin can then accept or reject from
                            the dashboard.
                        </p>
                        <p>
                            <span className="text-foreground font-medium">USDT:</span> Requires NOWPayments to be configured on
                            the server. Deposit address and amounts come from the provider.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
