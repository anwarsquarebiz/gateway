<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\MerchantIdAllocator;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with(['broker:id,name,email'])
            ->orderBy('name')
            ->paginate(20)
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->value,
                'merchant_id' => $u->merchant_id,
                'broker_id' => $u->broker_id,
                'broker' => $u->broker ? [
                    'id' => $u->broker->id,
                    'name' => $u->broker->name,
                    'email' => $u->broker->email,
                ] : null,
                'payin_fee_percent' => (string) $u->payin_fee_percent,
                'payout_fee_percent' => (string) $u->payout_fee_percent,
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a user (admin only).
     */
    public function create(): Response
    {
        $brokers = User::query()
            ->where('role', UserRole::Broker)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/users/create', [
            'brokers' => $brokers,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'payin_fee_percent' => $request->filled('payin_fee_percent') ? $request->input('payin_fee_percent') : null,
            'payout_fee_percent' => $request->filled('payout_fee_percent') ? $request->input('payout_fee_percent') : null,
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', Rule::in(array_map(fn (UserRole $r) => $r->value, UserRole::cases()))],
            'broker_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('role', UserRole::Broker->value)],
            'payin_fee_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'payout_fee_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $role = UserRole::from($validated['role']);

        $merchantId = $role === UserRole::Merchant
            ? MerchantIdAllocator::allocate()
            : null;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'merchant_id' => $merchantId,
            'broker_id' => $role === UserRole::Merchant ? ($validated['broker_id'] ?? null) : null,
            'role' => $role,
            'email_verified_at' => now(),
            'payin_fee_percent' => $validated['payin_fee_percent'] ?? 11,
            'payout_fee_percent' => $validated['payout_fee_percent'] ?? 4,
        ]);

        event(new Registered($user));

        return redirect()->route('admin.users.index')->with('status', 'user-created');
    }

    /**
     * Show the form for editing a user.
     */
    public function edit(User $user): Response
    {
        $brokers = User::query()
            ->where('role', UserRole::Broker)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'merchant_id' => $user->merchant_id,
                'broker_id' => $user->broker_id,
                'payin_api_key' => $user->payin_api_key,
                'payout_api_key' => $user->payout_api_key,
                'payin_fee_percent' => (string) $user->payin_fee_percent,
                'payout_fee_percent' => (string) $user->payout_fee_percent,
            ],
            'brokers' => $brokers,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(array_map(fn (UserRole $r) => $r->value, UserRole::cases()))],
            'broker_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('role', UserRole::Broker->value)],
            'payin_fee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'payout_fee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
        ];

        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Rules\Password::defaults()];
        }

        $validated = $request->validate($rules);

        $newRole = UserRole::from($validated['role']);

        $merchantId = $user->merchant_id;
        if ($newRole === UserRole::Merchant) {
            if ($merchantId === null) {
                $merchantId = MerchantIdAllocator::allocate();
            }
        } else {
            $merchantId = null;
        }

        $updates = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $newRole,
            'merchant_id' => $merchantId,
            'broker_id' => $newRole === UserRole::Merchant ? ($validated['broker_id'] ?? null) : null,
            'payin_fee_percent' => $validated['payin_fee_percent'],
            'payout_fee_percent' => $validated['payout_fee_percent'],
        ];

        if ($request->filled('password')) {
            $updates['password'] = Hash::make($request->string('password')->toString());
        }

        $user->update($updates);

        return redirect()->route('admin.users.index')->with('status', 'user-updated');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return redirect()->route('admin.users.index')->withErrors(['delete' => 'You cannot delete your own account.']);
        }

        if ($user->isAdmin()) {
            $adminCount = User::query()->where('role', UserRole::Admin)->count();
            if ($adminCount <= 1) {
                return redirect()->route('admin.users.index')->withErrors(['delete' => 'You cannot delete the last admin.']);
            }
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('status', 'user-deleted');
    }

    public function regeneratePayinApiKey(User $subject): RedirectResponse
    {
        $subject->forceFill([
            'payin_api_key' => User::generateUniqueApiKey('payin_api_key'),
        ])->save();

        return redirect()->route('admin.users.edit', $subject)->with('status', 'payin-api-key-regenerated');
    }

    public function regeneratePayoutApiKey(User $subject): RedirectResponse
    {
        $subject->forceFill([
            'payout_api_key' => User::generateUniqueApiKey('payout_api_key'),
        ])->save();

        return redirect()->route('admin.users.edit', $subject)->with('status', 'payout-api-key-regenerated');
    }
}
