<?php

use App\Http\Controllers\ClassesController;
use App\Http\Controllers\ClassesStudentsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\Classes;
use App\Models\ClassesStudents;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

// Guest middlewares
Route::group(['middleware' => ['guest']], function () {
    // GET
    Route::get('/login', fn() => Inertia::render('Guest/Login'))->name('login');

    // POST
    Route::post('/login', [UserController::class, 'authenticate']);
});

// Role: Admin
Route::group(['middleware' => ['auth', 'role:admin']], function () {
    // GET
    Route::get('/admin/dashboard', fn() => Inertia::render('Auth/Admin/Dashboard', [
        'role' => 'admin',
        'users' => fn() => User::with('roles')
            ->get()
            ->except(auth()->id())
            ->map(fn($user) => [
                'id' => Hashids::encode($user->id),
                'username' => $user->username,
                'role' => $user->roles->first()->name,
            ]),
    ]))->name('admin.dashboard');

    Route::get('/user/create', fn() => Inertia::render('Auth/Admin/CreateUser', [
        'role' => 'admin',
    ]))->name('admin.user.create');

    // POST
    Route::post('/user/create', [UserController::class, 'store']);
});

// Role: Instructor
Route::group(['middleware' => ['auth', 'role:instructor']], function () {
    // GET
    Route::get('/instructor/dashboard', function () {
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
    })->name('instructor.dashboard');

    Route::get('/class/create', fn() => Inertia::render('Auth/Instructor/CreateClass', [
        'role' => 'instructor',
    ]));

    Route::get('/class/{class_id}/students/add', fn($class_id) => Inertia::render('Auth/Instructor/ClassAddStudent', [
        'role' => 'instructor',
        'id' => $class_id,
        'students' => function () {
            $students = array_filter(User::role('student')->get()
                    ->map(function ($value) {
                        if (ClassesStudents::where('student_id', $value->id)->first() != null) {
                            return null;
                        }

                        $profile = $value->profile;

                        if ($profile == null) {
                            return null;
                        }

                        return [
                            'id' => Hashids::encode($value->id),
                            'student_id' => $value->username,
                            'name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.',
                            'contact' => $profile->contact,
                        ];
                    })->toArray(), fn($value) => $value != null);

            $final_students = [];

            foreach ($students as $student) {
                array_push($final_students, $student);
            }

            return $final_students;
        },
    ]));

    Route::get('/class/{class_id}/activity/create', fn($class_id) => Inertia::render('Auth/Instructor/ClassCreateActivity', [
        'role' => 'instructor',
        'id' => $class_id,
    ]));

    // POST
    Route::post('/class/create', [ClassesController::class, 'store']);
    Route::post('/class/{class_id}/students/add', [ClassesStudentsController::class, 'store']);
});

// Role: Instructor and Student
Route::group(['middleware' => ['auth', 'role:instructor|student']], function () {
    // GET
    Route::get('/class/overview/{class_id}', function ($class_id) {
        $user = auth()->user();
        $role = $user->roles->first()->name;

        if ($user->profile == null) {
            return redirect()->route('user.profile.edit');
        }

        if ($role == 'student') {
            // TODO redirect with proper $class_id
        }

        if ($role == 'instructor') {
            $profile = auth()->user()->profile;

            return Inertia::render('Auth/InstructorAndStudent/ClassOverview', [
                'role' => fn() => $role,
                'classes' => fn() => Classes::find(Hashids::decode($class_id)[0])
                    ->get()->map(fn($value) => [
                    'id' => $class_id,
                    'code' => $value->code,
                    'instructor_name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.',
                    'day' => $value->day,
                    'time_end' => $value->time_end,
                    'time_start' => $value->time_start,
                ])->first(),
            ]);
        }
    })->name('class.overview');

    Route::get('/profile/edit', function () {
        $user = auth()->user();

        return Inertia::render('Auth/InstructorAndStudent/EditProfile', [
            'role' => fn() => $user->roles->first()->name,
            'first' => fn() => $user->profile == null,
            'profile' => fn() => $user->profile,
        ]);

    })->name('user.profile.edit');

    // POST
    Route::post('/profile/edit', [ProfileController::class, 'store_or_update']);
});

// Authenticated middlewares
Route::group(['middleware' => ['auth']], function () {
    // GET
    Route::get('/', function () {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        } else if ($user->hasRole('instructor')) {
            return redirect()->route('instructor.dashboard');
        } else {
            if ($user->profile == null) {
                return redirect()->route('user.profile.edit');
            }
            return redirect()->route('class.overview');
        }
    });

    // POST
    Route::post('/logout', [UserController::class, 'logout']);

});
