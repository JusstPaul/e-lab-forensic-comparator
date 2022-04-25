<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
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
            'date_end' => 'nullable|required_unless:type,==,exam|date|nullable|after:today',
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

    public function store_check(Request $request, $class_id, $activity_id)
    {
        $answer = ActivitiesAnswer::where('id', Hashids::decode($activity_id))->first();
        $answer->update([
            'answers' => $request->answers,
            'is_checked' => $request->is_checked,
            'score' => $request->score,
        ]);

        return redirect()->route('class.overview.progress', [
            'class_id' => $class_id,
        ]);
    }

    public function show($class_id)
    {
        return Inertia::render('Auth/Instructor/ClassCreateActivity', [
            'role' => 'instructor',
            'id' => $class_id,
        ]);
    }
}
