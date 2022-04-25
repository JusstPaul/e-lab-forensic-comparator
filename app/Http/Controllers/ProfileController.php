<?php

namespace App\Http\Controllers;

use App\Models\ClassesStudents;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class ProfileController extends Controller
{
    public function store_or_update(Request $request)
    {
        $request->validate([
            'last_name' => 'required',
            'first_name' => 'required',
            'middle_name' => 'required',
            'contact' => 'required|min:10|regex:/^09[0-9]+$/',
            'password_change' => 'required|boolean',
            'password_current' => 'required_if:password_change,1|current_password|nullable',
            'password_new' => 'required_if:password_change,1|confirmed|nullable',
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

    public function show()
    {
        $user = auth()->user();
        $role = $user->roles->first()->name;
        $sidebar = [];

        if ($role == 'student') {
            $classes = ClassesStudents::where('student_id', $user->id)->first();

            if ($classes != null) {
                $classes = $classes->classes;

                $activities = $classes->activities()->get();
                $assignments = $activities->where('type', 'assignment')->map(fn($value) => [
                    'display' => $value->title,
                    'link' => '/' . 'class/' . Hashids::encode($classes->id) . '/' . 'activity/' . Hashids::encode($value->id),
                ]);

                $exams = $activities->where('type', 'exam')->map(fn($value) => [
                    'display' => $value->title,
                    'link' => '/' . 'class/' . Hashids::encode($classes->id) . '/' . 'activity/' . Hashids::encode($value->id),
                ]);

                $sidebar = [
                    [
                        'title' => 'Exams',
                        'elements' => $exams,
                    ],
                    [
                        'title' => 'Assignments',
                        'elements' => $assignments,
                    ],
                ];
            }
        }

        return Inertia::render('Auth/InstructorAndStudent/EditProfile', [
            'role' => fn() => $role,
            'first' => fn() => $user->profile == null,
            'profile' => fn() => $user->profile,
            'sidebar' => $sidebar,
        ]);
    }
}
