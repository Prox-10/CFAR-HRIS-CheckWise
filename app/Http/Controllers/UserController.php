<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->orderBy('created_at', 'desc')->get();
        $roles = Role::orderBy('name')->get();

        $transformedUsers = $users->transform(function ($user) {
            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'middlename' => $user->middlename,
                'lastname' => $user->lastname,
                'fullname' => $user->fullname,
                'email' => $user->email,
                'department' => $user->department,
                'roles' => $user->roles->pluck('name')->toArray(),
                'role_ids' => $user->roles->pluck('id')->toArray(),
                'created_at' => $user->created_at->format('d-m-Y'),
            ];
        });

        $transformedRoles = $roles->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        return Inertia::render('access/user/index', [
            'users' => $transformedUsers,
            'roles' => $transformedRoles,
        ]);
    }

    public function show(User $user)
    {
        $roles = Role::orderBy('name')->get();
        $transformedRoles = $roles->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        return Inertia::render('access/user/show', [
            'user' => [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'middlename' => $user->middlename,
                'lastname' => $user->lastname,
                'fullname' => $user->fullname,
                'email' => $user->email,
                'department' => $user->department,
                'roles' => $user->roles->pluck('name')->toArray(),
                'role_ids' => $user->roles->pluck('id')->toArray(),
                'created_at' => $user->created_at->format('d-m-Y'),
            ],
            'roles' => $transformedRoles,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('User store method called', ['data' => $request->all()]);

        $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'department' => 'required|string|max:255',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        try {
            $user = User::create([
                'firstname' => $request->firstname,
                'middlename' => $request->middlename,
                'lastname' => $request->lastname,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'department' => $request->department,
            ]);

            if ($request->has('roles') && is_array($request->roles)) {
                $roles = Role::whereIn('id', $request->roles)->get();
                $user->syncRoles($roles);
            }

            return redirect()->back()->with('success', 'User created successfully');
        } catch (\Exception $e) {
            Log::error('User creation failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'department' => 'required|string|max:255',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        try {
            $user->update([
                'firstname' => $request->firstname,
                'middlename' => $request->middlename,
                'lastname' => $request->lastname,
                'email' => $request->email,
                'department' => $request->department,
            ]);

            if ($request->has('roles') && is_array($request->roles)) {
                $roles = Role::whereIn('id', $request->roles)->get();
                $user->syncRoles($roles);
            }

            return redirect()->back()->with('success', 'User updated successfully');
        } catch (\Exception $e) {
            Log::error('User update failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()]);
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
            return redirect()->back()->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            Log::error('User deletion failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }
}
