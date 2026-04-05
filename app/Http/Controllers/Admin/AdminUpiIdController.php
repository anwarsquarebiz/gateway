<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminUpiId;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUpiIdController extends Controller
{
    public function index(Request $request): Response
    {
        $rows = AdminUpiId::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->paginate(20)
            ->through(fn (AdminUpiId $r) => [
                'id' => $r->id,
                'upi_id' => $r->upi_id,
                'receiving_amount_limit' => $r->receiving_amount_limit,
                'created_at' => $r->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/upi-ids/index', [
            'upiIds' => $rows,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/upi-ids/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'upi_id' => ['required', 'string', 'max:255'],
            'receiving_amount_limit' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['receiving_amount_limit'] = $this->normalizeLimit($validated['receiving_amount_limit'] ?? null);

        $request->user()->adminUpiIds()->create($validated);

        return redirect()->route('admin.upi-ids.index')->with('status', 'upi-id-created');
    }

    public function edit(Request $request, AdminUpiId $adminUpiId): Response
    {
        $this->assertOwns($request, $adminUpiId);

        return Inertia::render('admin/upi-ids/edit', [
            'upiId' => [
                'id' => $adminUpiId->id,
                'upi_id' => $adminUpiId->upi_id,
                'receiving_amount_limit' => $adminUpiId->receiving_amount_limit ?? '',
            ],
        ]);
    }

    public function update(Request $request, AdminUpiId $adminUpiId): RedirectResponse
    {
        $this->assertOwns($request, $adminUpiId);

        $validated = $request->validate([
            'upi_id' => ['required', 'string', 'max:255'],
            'receiving_amount_limit' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['receiving_amount_limit'] = $this->normalizeLimit($validated['receiving_amount_limit'] ?? null);

        $adminUpiId->update($validated);

        return redirect()->route('admin.upi-ids.index')->with('status', 'upi-id-updated');
    }

    public function destroy(Request $request, AdminUpiId $adminUpiId): RedirectResponse
    {
        $this->assertOwns($request, $adminUpiId);

        $adminUpiId->delete();

        return redirect()->route('admin.upi-ids.index')->with('status', 'upi-id-deleted');
    }

    private function assertOwns(Request $request, AdminUpiId $adminUpiId): void
    {
        abort_unless($adminUpiId->user_id === $request->user()->id, 403);
    }

    private function normalizeLimit(?string $value): ?string
    {
        $trimmed = $value !== null ? trim($value) : '';

        return $trimmed === '' ? null : $trimmed;
    }
}
