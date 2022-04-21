<?php

<<<<<<< HEAD
use App\Http\Controllers\ClassesController;
use App\Http\Controllers\ClassesStudentsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\Classes;
use App\Models\ClassesStudents;
=======
use App\Http\Controllers\UserController;
>>>>>>> 9a441ad (Start working on Profile Edit)
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
<<<<<<< HEAD
    Route::get('/admin/dashboard', fn() => Inertia::render('Auth/Admin/Dashboard', [
=======
    Route::get('/', fn() => Inertia::render('Auth/Admin/Dashboard', [
>>>>>>> 9a441ad (Start working on Profile Edit)
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

<<<<<<< HEAD
    Route::get('/user/create', fn() => Inertia::render('Auth/Admin/CreateUser', [
=======
    Route::get('/create/user', fn() => Inertia::render('Auth/Admin/CreateUser', [
>>>>>>> 9a441ad (Start working on Profile Edit)
        'role' => 'admin',
    ]))->name('admin.user.create');

    // POST
    Route::post('/user/create', [UserController::class, 'store']);
});

// Role: Instructor
Route::group(['middleware' => ['auth', 'role:instructor']], function () {
    // GET
    Route::get('/instructor/dashboard', function () {
<<<<<<< HEAD
        $user = auth()->user();
        $profile = $user->profile;

        if ($user->profile == null) {
=======
        if (auth()->user()->profile == null) {
>>>>>>> 9a441ad (Start working on Profile Edit)
            return redirect()->route('user.profile.edit');
        }

        return Inertia::render('Auth/Instructor/Dashboard', [
            'role' => 'instructor',
<<<<<<< HEAD
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
=======
        ]);
    })->name('instructor.dashboard');
>>>>>>> 9a441ad (Start working on Profile Edit)
});

// Role: Instructor and Student
Route::group(['middleware' => ['auth', 'role:instructor|student']], function () {
<<<<<<< HEAD
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
=======
    Route::get('/class/overview', function () {
        if (auth()->user()->profile == null) {
            return redirect()->route('user.profile.edit');
        }

        return Inertia::render('InstructorAndStudent/ClassOverview', [
            'role' => fn() => auth()->user()->roles->first()->name,
        ]);
    })->name('class.overview');
>>>>>>> 9a441ad (Start working on Profile Edit)
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
<<<<<<< HEAD
            if ($user->profile == null) {
                return redirect()->route('user.profile.edit');
            }
=======
>>>>>>> 9a441ad (Start working on Profile Edit)
            return redirect()->route('class.overview');
        }
    });

<<<<<<< HEAD
=======
    Route::get('/profile/edit', fn() => Inertia::render('Auth/EditProfile', [
        'role' => auth()->user()->roles->first()->name,
    ]))->name('user.profile.edit');

>>>>>>> 9a441ad (Start working on Profile Edit)
    // POST
    Route::post('/logout', [UserController::class, 'logout']);

});
