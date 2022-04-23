<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassesActivities;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'questions.*.files' => 'max:6|min:2',
            'questions.*.files.*' => 'image',
        ]);

        $questions = array_map(function ($value) {
            if ($value['files'] != null) {
                $files = array_map(function ($file) {
                    $hashname = md5_file($file->path()) . '-' . strval(time()) . '.' . $file->extension();
                    $name = 'class/instructor/activities/' . $hashname;

                    Storage::putFileAs('uploads', $file, $name);

                    return $name;
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
}
