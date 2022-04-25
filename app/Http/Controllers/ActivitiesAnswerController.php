<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use App\Models\Classes;
use App\Models\ClassesActivities;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class ActivitiesAnswerController extends Controller
{
    public function store(Request $request, $class_id, $activity_id)
    {
        $request->validate(([
            'answers' => 'required',
            'answers.id' => 'required',
            'answers.data' => 'required|array',
            'answers.data.*' => 'nullable',
            'answers.data.*.points' => 'required_unless:answers.data.*,!=,null|numeric',
            'answers.data.*.answer' => 'required_unless:answers.data.*,!=,null',
            'answers.data.*.answer.date' => 'required_if:answers.data.*.answer.title,!=,null',
            'answers.data.*.answer.instructions' => 'required_if:answers.data.*.answer.title,!=,null',
            'answers.data.*.answer.images' => 'required_if:answers.data.*.answer.title,!=,null|array',
            'answers.data.*.answer.scales.left' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.scales.right' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.location.left.x' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.location.left.y' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.location.right.x' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.location.right.y' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.current.left' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.current.right' => 'required_if:answers.data.*.answer.title,!=,null|numeric',
            'answers.data.*.answer.essay' => 'max:3000',
        ]));

        ActivitiesAnswer::create([
            'activity_id' => Hashids::decode($activity_id)[0],
            'student_id' => auth()->user()->id,
            'answers' => $request->answers,
        ]);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }

    public function show($class_id, $answer_id)
    {
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
    }

    public function show_to_answer($class_id, $activity_id)
    {
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
    }

    public function show_to_answer_controller($class_id, $activity_id, $answer_index)
    {
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
    }
}
