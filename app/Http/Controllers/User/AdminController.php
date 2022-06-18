<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Auth/Admin/Dashboard', [
            'role' => 'admin',
            'users' => fn() => User::with('roles')
                ->get()
                ->except(auth()->id())
                ->map(fn($user) => [
                    'id' => Hashids::encode($user->id),
                    'username' => $user->username,
                    'role' => $user->roles->first()->name,
                ]),
        ]);
    }

    public function password()
    {
        return Inertia::render('Auth/Admin/PasswordChange');
    }

    public function password_update(Request $request)
    {
        $request->validate([
            'password_current' => 'required|current_password',
            'password_new' => 'required|confirmed',
        ]);

        auth()->user()->update([
            'password' => Hash::make($request->password_new),
        ]);

        return redirect('/');
    }

}
