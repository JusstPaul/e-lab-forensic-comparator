<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassesActivities;
use Illuminate\Http\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class ClassesActivitiesController extends Controller
{
    public function store(Request $request, $class_id)
    {
        $classes = Classes::find(Hashids::decode($class_id)[0]);

        $request->validate([
            'title' => 'required|max:255',
            'type' => 'required|in:assignment,exam',
            'date_end' => 'required_if:type,assignment|date|after:today',
            'time_end' => 'required|date_format:H:i',
            'questions' => 'required',
            'questions.*.type' => 'required|in:directions,question,comparator,essay',
            'questions.*.choices' => 'nullable',
            'questions.*.instruction' => 'required',
            'questions.*.points' => 'required|numeric',
            'questions.*.files' => 'required_if:questions.*.type,comparator|nullable|max:6|min:2',
            'questions.*.files.*' => 'image',
        ]);

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

    public function answer_activity($class_id, $activity_id)
    {
        $activity = ClassesActivities::find(Hashids::decode($activity_id)[0]);
        $total_points = 0;

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
        ]);
    }

    public function comparator($class_id, $activity_id, $answer_index)
    {
        // TODO: Use redis
        return Inertia::render('Auth/Student/Comparator', [
            'id' => $class_id,
            'activity_id' => $activity_id,
            'answer_index' => $answer_index,
        ]);
    }
}
