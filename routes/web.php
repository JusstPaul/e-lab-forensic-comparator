<?php

use App\Http\Controllers\ActivitiesAnswerController;
use App\Http\Controllers\ClassesActivitiesController;
use App\Http\Controllers\ClassesController;
use App\Http\Controllers\ClassesStudentsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\ActivitiesAnswer;
use App\Models\Classes;
use App\Models\ClassesActivities;
use App\Models\ClassesStudents;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

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

    Route::get('/class/{class_id}/activity/{answer_id}/check',
        function ($class_id, $answer_id) {
            return Inertia::render('Auth/Instructor/ClassCheckAnswer', [
                'id' => $class_id,
                'answer_id' => $answer_id,
                'answer' => fn() => ActivitiesAnswer::find(Hashids::decode($answer_id))
                    ->map(function ($value) {
                        $student = User::where('users.id', $value->student_id)
                            ->join('profiles', 'profiles.user_id', '=', 'users.id')
                            ->first();

                        $activity = ClassesActivities::where('id', $value->activity_id)->first();
                        $total = 0;

                        foreach ($activity->questions as $question) {
                            $total += $question['points'];
                        }

                        return [
                            'activity' => [
                                'id' => Hashids::encode($value->activity_id),
                                'title' => $activity->title,
                                'type' => $activity->type,
                                'time_end' => $activity->time_end,
                                'date_end' => $activity->date_end,
                                'questions' => $activity->questions,
                                'total' => $total,
                            ],
                            'answers' => $value->answers,
                            'is_checked' => $value->is_checked,
                            'score' => $value->score,
                            'student' => [
                                'id' => Hashids::encode($value->student_id),
                                'username' => $student->username,
                                'name' => $student->last_name . ', ' . $student->first_name . ' ' . $student->middle_name[0] . '.',
                            ],
                        ];
                    })
                    ->first(),
            ]);
        })->name('class.activity.check');

    // POST
    Route::post('/class/create', [ClassesController::class, 'store']);
    Route::post('/class/{class_id}/students/add', [ClassesStudentsController::class, 'store']);
    Route::post('/class/{class_id}/activity/create', [ClassesActivitiesController::class, 'store']);
});

// Role: Student
Route::group(['middleware', ['auth', 'role:student']], function () {
    // GET
    Route::get('/no-class-yet', function () {
        return Inertia::render('Auth/Student/NoClass');
    })->name('class.unregistered');

    Route::get('/class/{class_id}/activity/{activity_id}', function ($class_id, $activity_id) {
        $activity = ClassesActivities::find(Hashids::decode($activity_id)[0]);
        $total_points = 0;

        foreach ($activity->questions as $question) {
            $total_points += $question['points'];
        }

        $classes = Classes::find(Hashids::decode($class_id)[0]);

        $activities = $classes->activities()->get();
        $assignments = $activities->where('type', 'assignment')->map(fn($value) => [
            'display' => $value->title,
            'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
        ]);

        $exams = $activities->where('type', 'exam')->map(fn($value) => [
            'display' => $value->title,
            'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
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

        return Inertia::render('Auth/Student/ActivityAnswer', [
            'id' => $class_id,
            'activity_id' => $activity_id,
            'activity' => [
                'id' => $activity_id,
                'type' => $activity->type,
                'title' => $activity->title,
                'date_end' => $activity->date_end,
                'time_end' => $activity->time_end,
                'questions' => $activity->questions,
                'created_at' => $activity->created_at,
            ],
            'total_points' => $total_points,
            'sidebar' => $sidebar,
        ]);
    })->name('class.activity');

    Route::get('/class/{class_id}/activity/{activity_id}/comparator/{answer_index}',
        function ($class_id, $activity_id, $answer_index) {

            $classes = Classes::find(Hashids::decode($class_id)[0]);

            $activities = $classes->activities()->get();
            $assignments = $activities->where('type', 'assignment')->map(fn($value) => [
                'display' => $value->title,
                'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
            ]);

            $exams = $activities->where('type', 'exam')->map(fn($value) => [
                'display' => $value->title,
                'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
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

            return Inertia::render('Auth/Student/Comparator', [
                'id' => $class_id,
                'activity_id' => $activity_id,
                'answer_index' => $answer_index,
                'sidebar' => $sidebar,
            ]);
        })->name('class.activity.comparator');

    // POST
    Route::post('/class/{class_id}/activity/{activity_id}', [ActivitiesAnswerController::class, 'store']);
});

// Role: Instructor and Student
Route::group(['middleware' => ['auth', 'role:instructor|student']], function () {
    // GET
    Route::get('/class/overview/{class_id}', function ($class_id) {
        $user = auth()->user();
        $role = $user->roles->first()->name;
        $profile = auth()->user()->profile;

        if ($profile == null) {
            return redirect()->route('user.profile.edit');
        }

        if ($role == 'student') {
            // TODO redirect with proper $class_id
            $classes = Classes::find(Hashids::decode($class_id)[0])->get()->first();
            $check_id = $classes->students()->get()->where('student_id', $user->id)->first();

            $instructor = $classes->user->profile;

            $done_activities = auth()->user()->activities()->get();

            $activities = $classes->activities()->get()
                ->filter(fn($value) => $done_activities->where('activity_id', $value->id)->first() == null);

            $assignments = $activities->where('type', 'assignment')->map(fn($value) => [
                'display' => $value->title,
                'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
            ]);

            $exams = $activities->where('type', 'exam')->map(fn($value) => [
                'display' => $value->title,
                'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
            ]);

            if ($check_id->classes->id == $classes->id) {
                return Inertia::render('Auth/InstructorAndStudent/ClassOverview', [
                    'role' => fn() => $role,
                    'classes' => fn() => Classes::find(Hashids::decode($class_id)[0])
                        ->get()->map(fn($value) => [
                        'id' => $class_id,
                        'code' => $value->code,
                        'instructor_name' => $instructor->last_name . ', ' . $instructor->first_name . ' ' . $instructor->middle_name[0] . '.',
                        'day' => $value->day,
                        'time_end' => $value->time_end,
                        'time_start' => $value->time_start,
                    ])->first(),
                    'sidebar' => [
                        [
                            'title' => 'Exams',
                            'elements' => $exams,
                        ],
                        [
                            'title' => 'Assignments',
                            'elements' => $assignments,
                        ],
                    ],
                ]);
            }

            return redirect('/');
        }

        if ($role == 'instructor') {

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
                'sidebar' => [],
            ]);
        }
    })->name('class.overview');

    Route::get('/class/{class_id}/overview/progress/{student_id?}/{activity_id?}',
        function ($class_id, $student_id = null, $activity_id = null) {
            $user = auth()->user();
            $profile = $user->profile;

            if ($profile == null) {
                return redirect()->route('user.profile.edit');
            }

            $role = $user->roles->first()->name;

            if ($role == 'student') {
                $classes = Classes::find(Hashids::decode($class_id)[0])->get()->first();
                $check_id = $classes->students()->get()->where('student_id', $user->id)->first();

                $done_activities = auth()->user()->activities()->get();

                $activities = $classes->activities()->get()
                    ->filter(fn($value) => $done_activities->where('activity_id', $value->id)->first() == null);

                $assignments = $activities->where('type', 'assignment')->map(fn($value) => [
                    'display' => $value->title,
                    'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
                ]);

                $exams = $activities->where('type', 'exam')->map(fn($value) => [
                    'display' => $value->title,
                    'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
                ]);

                if ($check_id->classes->id == $classes->id) {
                    return Inertia::render('Auth/InstructorAndStudent/ClassViewProgress', [
                        'id' => $class_id,
                        'role' => 'student',
                        'sidebar' => [
                            [
                                'title' => 'Exams',
                                'elements' => $exams,
                            ],
                            [
                                'title' => 'Assignments',
                                'elements' => $assignments,
                            ],
                        ],
                    ]);
                }

                return redirect('/');
            }

            return Inertia::render('Auth/InstructorAndStudent/ClassViewProgress', [
                'id' => $class_id,
                'role' => 'instructor',
                'sidebar' => [],
                'students' => fn() => Classes::find(Hashids::decode($class_id)[0])
                    ->students()
                    ->get()
                    ->map(function ($classes) {
                        $student = User::where('users.id', $classes->student_id)
                            ->join('profiles', 'profiles.user_id', '=', 'users.id')
                            ->first();

                        return [
                            'id' => Hashids::encode($student->user_id),
                            'username' => $student->username,
                            'name' => $student->last_name . ', ' . $student->first_name . ' ' . $student->middle_name[0] . '.',
                        ];
                    }),
                'current_student' => function () use ($student_id, $class_id) {
                    if ($student_id == null) {
                        return null;
                    }

                    $activities = ClassesActivities::where('classes_id', Hashids::decode($class_id)[0])->get();
                    $student = User::where('users.id', Hashids::decode($student_id)[0])
                        ->join('profiles', 'profiles.user_id', 'users.id')
                        ->first();

                    $activities_status = [];
                    foreach ($activities as $activity) {
                        $answer = ActivitiesAnswer::where('student_id', Hashids::decode($student_id)[0])
                            ->where('activity_id', $activity->id)
                            ->first();
                        $date = new DateTime($activity->date_end . ' ' . $activity->time_end);

                        if ($answer == null) {
                            array_push($activities_status, [
                                'id' => null,
                                'type' => $activity->type,
                                'title' => $activity->title,
                                'score' => 'No submits',
                                'is_late' => new DateTime('now') > $date,
                            ]);
                        } else {
                            $total = 0;
                            foreach ($answer->answers['data'] as $data) {
                                if ($data != null) {
                                    $total += $data['points'];
                                }
                            }

                            array_push($activities_status, [
                                'id' => Hashids::encode($answer->id),
                                'type' => $activity->type,
                                'title' => $activity->title,
                                'score' => $answer->is_checked ? $answer->score . '/' . $total : 'Unchecked',
                                'is_late' => new DateTime($answer->updated_at) > $date,
                            ]);
                        }
                    }

                    $exams = array_filter($activities_status, function ($activity) {
                        return $activity['type'] == 'exam';
                    });
                    $assignments = array_filter($activities_status, function ($activity) {
                        return $activity['type'] == 'assignment';
                    });

                    return [
                        'student' => [
                            'id' => $student_id,
                            'username' => $student->username,
                            'name' => $student->last_name . ', ' . $student->first_name . ' ' . $student->middle_name[0] . '.',
                        ],
                        'exams' => $exams,
                        'assignments' => $assignments,
                    ];
                },
            ]);

        })->name('class.overview.progress');

    Route::get('/profile/edit', function () {
        $user = auth()->user();
        $role = $user->roles->first()->name;
        $sidebar = [];

        if ($role == 'student') {
            $classes = ClassesStudents::where('student_id', $user->id)->first()->classes;

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

        return Inertia::render('Auth/InstructorAndStudent/EditProfile', [
            'role' => fn() => $role,
            'first' => fn() => $user->profile == null,
            'profile' => fn() => $user->profile,
            'sidebar' => $sidebar,
        ]);

    })->name('user.profile.edit');

    Route::get('/class/{class_id}/students/view', function ($class_id) {
        $user = auth()->user();
        $role = $user->roles->first()->name;
        $classes = Classes::find(Hashids::decode($class_id)[0]);
        $sidebar = [];

        if ($role == 'student') {
            $classes = Classes::find(Hashids::decode($class_id)[0]);

            $activities = $classes->activities()->get();
            $assignments = $activities->where('type', 'assignment')->map(fn($value) => [
                'display' => $value->title,
                'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
            ]);

            $exams = $activities->where('type', 'exam')->map(fn($value) => [
                'display' => $value->title,
                'link' => '/' . 'class/' . $class_id . '/' . 'activity/' . Hashids::encode($value->id),
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

        return Inertia::render('Auth/InstructorAndStudent/ClassViewStudents', [
            'role' => $role,
            'id' => $class_id,
            'students' => fn() => $classes->students()->get()->map(function ($value) use ($role, $classes) {
                $user = User::find($value->student_id);
                $profile = $user->profile;

                return [
                    'id' => Hashids::encode($user->id),
                    'student_id' => $user->username,
                    'name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.',
                    'contact' => ($role == 'student' ? null : $profile->contact),
                ];
            }),
            'sidebar' => $sidebar,
        ]);
    });

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

            $classes = ClassesStudents::where('student_id', $user->id)
                ->get()
                ->first();

            if ($classes == null) {
                return redirect()->route('class.unregistered');
            }

            return redirect()->route('class.overview', [
                'class_id' => Hashids::encode($classes->classes->id),
            ]);
        }
    });

    // POST
    Route::post('/logout', [UserController::class, 'logout']);

});
