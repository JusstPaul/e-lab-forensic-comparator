<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Session;
use Vinkla\Hashids\Facades\Hashids;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        } else if ($user->hasRole('instructor')) {
            return redirect()->route('instructor.dashboard');
        } else {
            if ($user->profile == null) {
                return redirect()->route('user.profile.edit');
            }

            if ($user->joined_classes == null) {
                return redirect()->route('class.unregistered');
            }

            return redirect()->route('class.overview', [
                'class_id' => Hashids::encode($user->joined_classes),
            ]);
        }
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|max:16|unique:users,username',
            'type' => 'in:admin,instructor,student',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->username),
            'remember_token' => Str::random(10),
        ]);

        $user->assignRole($request->type);

        return redirect('/');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Login user
     *
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function authenticate(Request $request)
    {
        $request->validate([
            'username' => 'required|max:16',
            'password' => 'required',
            'remember' => 'required|in:0,1',
        ]);

        $credentials = $request->only('username', 'password');

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            return redirect('/');
        }

        return back()->withErrors([
            'username' => 'Invalid user credentials',
        ]);
    }

    /**
     * Logout user
     * @return \Illuminate\Http\Response
     */
    public function logout()
    {
        Session::flush();
        Auth::logout();

        return redirect('/login');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function edit($user_id)
    {
        $user = User::find(Hashids::decode($user_id)[0]);

        return Inertia::render('Auth/Admin/EditUser', [
            'id' => $user_id,
            'username' => $user->username,
            'role' => $user->roles->first()->name,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $user_id)
    {
        $request->validate([
            'username' => 'required|max:16',
            'role' => 'required|in:admin,instructor,student',
            'reset_password' => 'required|boolean',
        ]);

        $user = User::find(Hashids::decode($user_id)[0]);
        $user->username = $request->username;
        $user->syncRoles([$request->role]);

        if ($user->reset_password) {
            $user->password = Hash::make($user->username);
        }
        $user->save();

        return redirect()->route('admin.dashboard');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy($user_id)
    {
        User::destroy(Hashids::decode($user_id)[0]);
        return redirect()->route('admin.dashboard');
    }
}
