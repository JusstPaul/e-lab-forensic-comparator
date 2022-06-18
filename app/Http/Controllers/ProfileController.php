<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function store_or_update(Request $request)
    {
        $request->validate([
            'last_name' => 'required',
            'first_name' => 'required',
            'contact' => 'required|min:10|regex:/^09[0-9]+$/',
            'password_change' => 'required|boolean',
            'password_current' => 'required_if:password_change,1|current_password|nullable',
            'password_new' => 'required_if:password_change,1|min:6|confirmed|nullable',
        ]);

        $user = auth()->user();

        if ($request->password_change) {
            $user->update([
                'password' => Hash::make($request->password_new),
            ]);
        }

        $user->profile()->updateOrCreate(['user_id' => $user->id], [
            'last_name' => $request->last_name,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'contact' => $request->contact,
        ]);

        return redirect('/');
    }

    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Auth/InstructorAndStudent/EditProfile', [
            'first' => fn() => $user->profile == null,
            'profile' => fn() => $user->profile,
        ]);

    }
}
