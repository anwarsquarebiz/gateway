<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminUsdtAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUsdtAddressController extends Controller
{
    public function index(Request $request): Response
    {
        $rows = AdminUsdtAddress::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->paginate(20)
            ->through(fn (AdminUsdtAddress $r) => [
                'id' => $r->id,
                'public_address' => $r->public_address,
                'receiving_amount_limit' => $r->receiving_amount_limit,
                'created_at' => $r->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/usdt-addresses/index', [
            'addresses' => $rows,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/usdt-addresses/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'public_address' => ['required', 'string', 'max:255'],
            'receiving_amount_limit' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['receiving_amount_limit'] = $this->normalizeLimit($validated['receiving_amount_limit'] ?? null);

        $request->user()->adminUsdtAddresses()->create($validated);

        return redirect()->route('admin.usdt-addresses.index')->with('status', 'usdt-address-created');
    }

    public function edit(Request $request, AdminUsdtAddress $adminUsdtAddress): Response
    {
        $this->assertOwns($request, $adminUsdtAddress);

        return Inertia::render('admin/usdt-addresses/edit', [
            'address' => [
                'id' => $adminUsdtAddress->id,
                'public_address' => $adminUsdtAddress->public_address,
                'receiving_amount_limit' => $adminUsdtAddress->receiving_amount_limit ?? '',
            ],
        ]);
    }

    public function update(Request $request, AdminUsdtAddress $adminUsdtAddress): RedirectResponse
    {
        $this->assertOwns($request, $adminUsdtAddress);

        $validated = $request->validate([
            'public_address' => ['required', 'string', 'max:255'],
            'receiving_amount_limit' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['receiving_amount_limit'] = $this->normalizeLimit($validated['receiving_amount_limit'] ?? null);

        $adminUsdtAddress->update($validated);

        return redirect()->route('admin.usdt-addresses.index')->with('status', 'usdt-address-updated');
    }

    public function destroy(Request $request, AdminUsdtAddress $adminUsdtAddress): RedirectResponse
    {
        $this->assertOwns($request, $adminUsdtAddress);

        $adminUsdtAddress->delete();

        return redirect()->route('admin.usdt-addresses.index')->with('status', 'usdt-address-deleted');
    }

    private function assertOwns(Request $request, AdminUsdtAddress $adminUsdtAddress): void
    {
        abort_unless($adminUsdtAddress->user_id === $request->user()->id, 403);
    }

    private function normalizeLimit(?string $value): ?string
    {
        $trimmed = $value !== null ? trim($value) : '';

        return $trimmed === '' ? null : $trimmed;
    }
}
