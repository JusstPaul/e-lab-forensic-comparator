<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use Cache;
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

        Cache::forget('class:' . $class_id . '-activity:' . $activity_id);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }

    public function restore_answers(Request $request, $class_id, $activity_id, $answer_index)
    {
        $answer = Cache::get('class:' . $class_id . '-activity:' . $activity_id);
        $answer['data'][$answer_index]['answer'] = $request->data;
        Cache::forever('class:' . $class_id . '-activity:' . $activity_id, $answer);

        return redirect()->route('class.activity', [
            'activity_id' => $activity_id,
            'class_id' => $class_id,
        ]);
    }

    public function store_answer_cache(Request $request, $class_id, $activity_id, $answer_index)
    {
        Cache::forever('class:' . $class_id . '-activity:' . $activity_id, $request->answers);

        return redirect()->route('class.activity.comparator', [
            'class_id' => $class_id,
            'activity_id' => $activity_id,
            'answer_index' => $answer_index,
        ]);
    }

    public function show_answers($class_id, $activity_id, $student_id)
    {
        return Inertia::render('Auth/InstructorAndStudent/ClassShowAnswers', [
            'id' => $class_id,
            'activity_id' => $activity_id,
            'student_id' => $student_id,
            'answers' => fn() => ActivitiesAnswer::where('activity_id', Hashids::decode($activity_id)[0])
                ->where('student_id', Hashids::decode($student_id)[0])
                ->get()
                ->map(fn($val) => [
                    'id' => $val->answers['id'],
                    'data' => $val->answers['data'],
                ])->first(),
        ]);
    }
}
