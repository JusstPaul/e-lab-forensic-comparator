<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class InstructorController extends Controller
{

    public function index()
    {
        $user = auth()->user();
        $profile = $user->profile;

        if ($user->profile == null) {
            return redirect()->route('user.profile.edit');
        }

        return Inertia::render('Auth/Instructor/Dashboard', [
            'classes' => fn() => $user->classes->map(fn($value) => [
                'id' => Hashids::encode($value->id),
                'code' => $value->code,
                'day' => $value->day,
                'room' => $value->room,
                'time_start' => $value->time_start,
                'time_end' => $value->time_end,
            ]),
        ]);
    }

    public function create_class()
    {
        return Inertia::render('Auth/Instructor/CreateClass');
    }

}
