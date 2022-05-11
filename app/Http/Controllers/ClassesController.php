<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use App\Models\ActivitiesChecks;
use App\Models\Classes;
use App\Models\ClassesActivities;
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
            'time_start' => 'required',
            'time_end' => 'required|after:time_start',
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

    public function destroy($class_id)
    {
        Classes::destroy(Hashids::decode($class_id)[0]);
        return redirect()->route('instructor.dashboard');
    }

    public function edit($class_id)
    {
        $class = Classes::find(Hashids::decode($class_id)[0]);

        return Inertia::render('Auth/Instructor/EditClass', [
            'id' => $class_id,
            'section' => $class->code,
            'room' => $class->room,
            'day' => $class->day,
            'time_start' => $class->time_start,
            'time_end' => $class->time_end,
        ]);
    }

    public function update(Request $request, $class_id)
    {
        $request->validate([
            'section' => 'required|max:16',
            'room' => 'required|max:10',
            'day' => 'required|in:MWF,TTh,Sat',
            'time_start' => 'required',
            'time_end' => 'required|after:time_start',
        ]);
        $class = Classes::find(Hashids::decode($class_id)[0]);
        $class->code = $request->section;
        $class->room = $request->room;
        $class->day = $request->day;
        $class->time_start = $request->time_start;
        $class->time_end = $request->time_end;
        $class->save();

        return redirect()->route('instructor.dashboard');
    }

    public function store_add_students(Request $request, $class_id)
    {
        $request->validate([
            'selected' => 'required|array',
        ]);

        $decoded_class_id = Hashids::decode($class_id)[0];

        $decoded = array_map(function ($value) {
            return Hashids::decode($value)[0];
        }, $request->selected);

        User::whereIn('id', $decoded)->update([
            'joined_classes' => $decoded_class_id,
        ]);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }

    public function remove_students(Request $request, $class_id)
    {
        $request->validate([
            'students' => 'required|array',
        ]);

        $ids = array_map(function ($id) {
            return Hashids::decode($id)[0];
        }, $request->students);

        User::whereIn('id', $ids)->update([
            'joined_classes' => null,
        ]);

        return redirect()->route('class.students.view', [
            'class_id' => $class_id,
        ]);
    }

    public function show_add_students($class_id)
    {
        return Inertia::render('Auth/Instructor/ClassAddStudent', [
            'id' => $class_id,
            'students' => function () {
                return User::role('student')
                    ->where('joined_classes', null)
                    ->join('profiles', 'profiles.user_id', 'users.id')
                    ->get()
                    ->map(function ($value) {
                        return [
                            'id' => Hashids::encode($value->user_id),
                            'student_id' => $value->username,
                            'name' => $value->last_name . ', ' . $value->first_name . ' ' . $value->middle_name[0] . '.',
                            'contact' => $value->contact,
                        ];
                    });
            },
        ]);
    }

    public function index($class_id)
    {

        $user = auth()->user();
        $role = $user->roles->first()->name;
        $profile = auth()->user()->profile;

        if ($profile == null) {
            return redirect()->route('user.profile.edit');
        }

        $classes = Classes::find(Hashids::decode($class_id)[0])->get()->first();

        if ($role == 'student' && $user->joined_classes != $classes->id) {
            return redirect('/');
        }

        return Inertia::render('Auth/InstructorAndStudent/ClassOverview', [
            'classes' => fn() => Classes::where('id', Hashids::decode($class_id)[0])
                ->get()->map(fn($value) => [
                'id' => $class_id,
                'code' => $value->code,
                'instructor_name' => function () use ($profile, $role, $classes) {
                    if ($role == 'student') {
                        $instructor = $classes->user->profile;
                        return $instructor->last_name . ', ' . $instructor->first_name . ' ' . $instructor->middle_name[0] . '.';
                    }
                    return $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.';
                },
                'day' => $value->day,
                'time_end' => $value->time_end,
                'time_start' => $value->time_start,
            ])->first(),
            'cards' => function () use ($classes, $class_id, $role) {
                $cards = [];

                $announcements = $classes->announcements()->get();
                foreach ($announcements as $announcement) {
                    array_push($cards, [
                        'type' => 'announcement',
                        'display' => $announcement['text'],
                        'link' => '/class/' . $class_id . '/announcement/view/' . Hashids::encode($announcement['id']),
                        'created_at' => $announcement['created_at'],
                    ]);
                }

                $activities = ClassesActivities::where('classes_id', $classes->id)->get();
                foreach ($activities as $activity) {
                    if ($role == 'student') {
                        array_push($cards, [
                            'type' => 'activity',
                            'display' => $activity['title'],
                            'link' => '/class/' . Hashids::encode($classes->id) . '/activity/' . Hashids::encode($activity['id']),
                            'created_at' => $activity['created_at'],
                        ]);
                    } else {
                        array_push($cards, [
                            'type' => 'activity',
                            'display' => $activity['title'],
                            //'link' => '/class/' . $class_id . '/activity/view/' . Hashids::encode($activity['id']),
                            'link' => '/class' . '/' . $class_id . '/overview/progress',
                            'created_at' => $activity['created_at'],
                        ]);

                    }
                }

                usort($cards, function ($card1, $card2) {
                    $dt1 = strtotime($card1['created_at']);
                    $dt2 = strtotime($card2['created_at']);
                    return $dt2 - $dt1;
                });

                return $cards;
            },
        ]);
    }

    public function view_students($class_id)
    {
        $classes = Classes::find(Hashids::decode($class_id)[0]);

        return Inertia::render('Auth/InstructorAndStudent/ClassViewStudents', [
            'id' => $class_id,
            'students' => fn() => $classes->students()
                ->join('profiles', 'profiles.user_id', '=', 'users.id')
                ->get()
                ->map(function ($value) {
                    return [
                        'id' => Hashids::encode($value->user_id),
                        'student_id' => $value->username,
                        'name' => $value->last_name . ', ' . $value->first_name . ' ' . $value->middle_name[0] . '.',
                        'contact' => $value->contact,
                    ];
                }),
        ]);
    }

    public function view_progress($class_id, $student_id = null, $activity_id = null)
    {
        $user = auth()->user();
        $profile = $user->profile;
        $role = $user->roles->first()->name;

        if ($profile == null) {
            return redirect()->route('user.profile.edit');
        }

        return Inertia::render('Auth/InstructorAndStudent/ClassViewProgress', [
            'id' => $class_id,
            'students' => function () use ($class_id, $user, $profile, $role) {
                if ($role == 'student') {
                    return [[
                        'id' => Hashids::encode($user->id),
                        'username' => $user->username,
                        'name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '. ',
                    ]];
                }

                return Classes::find(Hashids::decode($class_id)[0])
                    ->students()
                    ->join('profiles', 'profiles.user_id', '=', 'users.id')
                    ->get()
                    ->map(function ($student) {
                        return [
                            'id' => Hashids::encode($student->user_id),
                            'username' => $student->username,
                            'name' => $student->last_name . ', ' . $student->first_name . ' ' . $student->middle_name[0] . '.',
                        ];
                    });
            },
            'current_student' => function () use ($student_id, $class_id, $role, $user, $activity_id) {
                if ($student_id == null && $role != 'student') {
                    return;
                }

                if ($role == 'student' && Hashids::decode($student_id)[0] != $user->id) {
                    return redirect()->route('class.overview.progress', [
                        'activity_id' => $activity_id,
                        'class_id' => $class_id,
                        'student_id' => Hashids::encode($user->id),
                    ]);
                }

                $activities = ClassesActivities::where('classes_id',
                    Hashids::decode($class_id)[0])->get();
                $student = User::where('users.id', Hashids::decode($student_id)[0])
                    ->join('profiles', 'profiles.user_id', 'users.id')
                    ->first();

                $activities_status = [];
                foreach ($activities as $activity) {
                    $answer = ActivitiesAnswer::where('student_id',
                        Hashids::decode($student_id)[0])
                        ->where('activity_id', $activity->id)
                        ->first();
                    $date = new DateTime($activity->date_end . ' ' . $activity->time_end);

                    if ($answer == null) {
                        array_push($activities_status, [
                            'id' => null,
                            'type' => $activity->type,
                            'title' => $activity->title,
                            'score' => 'None',
                            'is_late' => new DateTime('now') > $date,
                        ]);
                    } else {
                        $total = 0;
                        foreach ($answer->answers['data'] as $data) {
                            if ($data != null) {
                                $total += $data['points'];
                            }
                        }

                        $check = ActivitiesChecks::where('answer_id', $answer->id)->first();

                        array_push($activities_status, [
                            'id' => Hashids::encode($answer->id),
                            'type' => $activity->type,
                            'title' => $activity->title,
                            'score' => $check != null ? $check->score . '/' . $total : 'Submitted',
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
