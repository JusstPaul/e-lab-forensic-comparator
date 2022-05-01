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

    public function index($class_id)
    {

        $user = auth()->user();
        $role = $user->roles->first()->name;
        $profile = auth()->user()->profile;

        if ($profile == null) {
            return redirect()->route('user.profile.edit');
        }

        $classes = Classes::find(Hashids::decode($class_id)[0])->get()->first();
        $check_id = $classes->students()->get()->where('student_id', $user->id)->first();

        if ($role == 'student' && $check_id->classes->id != $classes->id) {
            return redirect('/');
        }

        return Inertia::render('Auth/InstructorAndStudent/ClassOverview', [
            'classes' => fn() => Classes::find(Hashids::decode($class_id)[0])
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
            'cards' => function () use ($classes) {
                $cards = [];

                $announcements = $classes->announcements()->get();
                foreach ($announcements as $announcement) {
                    array_push($cards, [
                        'type' => 'announcement',
                        'display' => $announcement['text'],
                        'link' => '#',
                        'created_at' => $announcement['created_at'],
                    ]);
                }

                $activities = ClassesActivities::where('classes_id', $classes->id)->get();
                foreach ($activities as $activity) {
                    array_push($cards, [
                        'type' => 'activity',
                        'display' => $activity['title'],
                        'link' => '/class/' . Hashids::encode($classes->id) . '/activity/' . Hashids::encode($activity['id']),
                        'created_at' => $activity['created_at'],
                    ]);
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
        $user = auth()->user();
        $role = $user->roles->first()->name;
        $classes = Classes::find(Hashids::decode($class_id)[0]);

        return Inertia::render('Auth/InstructorAndStudent/ClassViewStudents', [
            'id' => $class_id,
            'students' => fn() => $classes->students()->get()->map(function ($value) use ($role) {
                $user = User::find($value->student_id);
                $profile = $user->profile;

                return [
                    'id' => Hashids::encode($user->id),
                    'student_id' => $user->username,
                    'name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.',
                    'contact' => ($role == 'student' ? null : $profile->contact),
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

                $students = Classes::find(Hashids::decode($class_id)[0])
                    ->students()
                    ->get()
                    ->map(function ($classes) {
                        $student = User::where('users.id', $classes->student_id)
                            ->join('profiles', 'profiles.user_id', '=', 'users.id')
                            ->first();

                        return [
                            'id' => Hashids::encode($student->user_id),
                            'username' => $student->username,
                            'name' => $student->last_name . ', ' . $student->first_name . ' ' . $student->middle_name[0] . '. ',
                        ];
                    });

                return $students;
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
