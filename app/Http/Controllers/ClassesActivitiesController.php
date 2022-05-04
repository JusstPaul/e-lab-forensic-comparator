<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassesActivities;
use Cache;
use Illuminate\Http\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class ClassesActivitiesController extends Controller
{
    public function store(Request $request, $class_id)
    {
        $request->validate([
            'title' => 'required|max:255',
            'type' => 'required|in:assignment,exam',
            'date_end' => 'required_if:type,assignment|date|after:today',
            'time_end' => 'required|date_format:H:i',
            'questions' => 'required',
            'questions.*.type' => 'required|in:directions,question,comparator,essay',
            'questions.*.choices' => 'nullable',
            'questions.*.choices.data' => 'required_if:questions.*.choices.active,==,1|array',
            'questions.*.choices.type' => 'required_if:questions.*.choices.active,==,1|in:radio,checkbox',
            'questions.*.instruction' => 'required',
            'questions.*.points' => 'required|numeric',
            'questions.*.files' => 'required_if:questions.*.type,comparator|nullable|max:6|min:2',
            'questions.*.files.*' => 'image',
        ]);

        $classes = Classes::find(Hashids::decode($class_id)[0]);
        $questions = array_map(function ($value) {
            if ($value['files'] != null) {
                $files = array_map(function ($file) {
                    return Storage::disk('s3')
                        ->put('class/instructor/activities', new File($file));
                }, $value['files']);

                $value['files'] = $files;
            }

            return $value;
        }, $request->questions);

        $activity = new ClassesActivities;
        $activity->title = $request->title;
        $activity->type = $request->type;
        $activity->date_end = $request->type != 'exam' ? $request->date_end : date('Y-m-d');
        $activity->time_end = $request->time_end;
        $activity->questions = $questions;

        $classes->activities()->save($activity);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }

    public function index($class_id)
    {
        return Inertia::render('Auth/Instructor/ClassCreateActivity', [
            'id' => $class_id,
        ]);
    }

    public function view($class_id, $activity_id)
    {
        $id = Hashids::decode($activity_id)[0];

        return Inertia::render('Auth/Instructor/ClassViewActivity', [
            'id' => $class_id,
            'activity' => function () use ($id, $activity_id) {
                $activity = ClassesActivities::find($id);

                return [
                    'id' => $activity_id,
                    'title' => $activity->title,
                    'date_end' => $activity->date_end,
                    'time_end' => $activity->time_end,
                ];
            },
        ]);
    }

    public function import_index($class_id)
    {
        $user = auth()->user();

        return Inertia::render('Auth/Instructor/ClassImportActivity', [
            'id' => $class_id,
            'activities' => fn() => Classes::where('instructor_id', $user->id)
                ->join('classes_activities', 'classes_activities.classes_id', '=', 'classes.id')
                ->get()
                ->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'title' => $value->title,
                        'created_at' => $value->created_at,
                    ];
                }),
        ]);
    }

    public function answer_activity($class_id, $activity_id)
    {
        $activity = ClassesActivities::find(Hashids::decode($activity_id)[0]);
        $total_points = 0;
        $cached_answer = Cache::get('user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id);

        foreach ($activity->questions as $question) {
            $total_points += $question['points'];
        }

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
            'cached_answer' => $cached_answer,
        ]);
    }

    public function comparator($class_id, $activity_id, $answer_index)
    {
        $answer = Cache::get('user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id);
        if ($answer == null) {
            return redirect('/');
        }

        $answer['data'][$answer_index]['answer']['select_mode'] = 'left';
        if ($answer['data'][$answer_index]['answer']['essay'] == null) {
            $answer['data'][$answer_index]['answer']['essay'] = '';
        }
        return Inertia::render('Auth/Student/Comparator', [
            'id' => $class_id,
            'activity_id' => $activity_id,
            'answer_index' => $answer_index,
            'state' => $answer['data'][$answer_index],
        ]);
    }
}
