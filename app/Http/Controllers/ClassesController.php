<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use App\Models\Classes;
use App\Models\ClassesActivities;
use App\Models\ClassesStudents;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class ClassesController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'section' => 'required|max:16',
            'room' => 'required|max:10',
            'day' => 'required|in:MWF,TTh,Sat',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'required|date_format:H:i|after:time_start',
        ]);

        $classes = new Classes;
        $classes->code = $request->section;
        $classes->room = $request->room;
        $classes->day = $request->day;
        $classes->time_start = $request->time_start;
        $classes->time_end = $request->time_end;

        auth()->user()->classes()->save($classes);

        return redirect('/');
    }

    public function show($class_id)
    {
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
    }

    public function show_create()
    {
        return Inertia::render('Auth/Instructor/CreateClass', [
            'role' => 'instructor',
        ]);
    }

    public function show_add($class_id)
    {
        return Inertia::render('Auth/Instructor/ClassAddStudent', [
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
        ]);
    }

    public function show_students($class_id)
    {
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
    }

    public function show_progress($class_id, $student_id = null, $activity_id = null)
    {
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

    }
}
