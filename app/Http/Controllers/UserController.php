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
            'password' => Hash::make(env('DEFAULT_PASSWORD', 'passwd')),
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

    public function show_admin()
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

    public function show_create()
    {
        return Inertia::render('Auth/Admin/CreateUser', [
            'role' => 'admin',
        ]);
    }

    public function show_instructor()
    {
        $user = auth()->user();
        $profile = $user->profile;

        if ($user->profile == null) {
            return redirect()->route('user.profile.edit');
        }

        return Inertia::render('Auth/Instructor/Dashboard', [
            'role' => 'instructor',
            'classes' => fn() => $user->classes->map(fn($value) => [
                'id' => Hashids::encode($value->id),
                'code' => $value->code,
                'day' => $value->day,
                'room' => $value->room,
                'time_start' => $value->time_start,
                'time_end' => $value->time_end,
            ]),
            'name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.',
        ]);
    }

    public function show_student_unregistered()
    {
        return Inertia::render('Auth/Student/NoClass');
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
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy($user_id)
    {
        User::destroy(Hashids::decode($user_id));
        return redirect()->route('admin.dashboard');
    }
}
