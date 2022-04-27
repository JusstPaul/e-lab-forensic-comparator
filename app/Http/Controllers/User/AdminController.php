<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
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

    public function create()
    {
        return Inertia::render('Auth/Admin/CreateUser');
    }

}
