<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use App\Models\ActivitiesChecks;
use Cache;
use Illuminate\Http\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

        Cache::forget('user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }

    public function restore_answers(Request $request, $class_id, $activity_id, $answer_index)
    {
        $answer = Cache::get('user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id);
        $data = $request->data;

        $finalData = [];
        foreach ($data as $d) {
            $newData = $d;
            $newData['image'] = Storage::disk('s3')
                ->put('cache/' . 'user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id, new File($newData['image']));
            $newData['isKey'] = true;

            array_push($finalData, $newData);
        }

        $answer['data'][$answer_index]['answer'] = $finalData;
        Cache::forever('user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id, $answer);

        return redirect()->route('class.activity', [
            'activity_id' => $activity_id,
            'class_id' => $class_id,
        ]);
    }

    public function store_answer_cache(Request $request, $class_id, $activity_id, $answer_index)
    {
        Cache::forever('user:' . auth()->user()->id . '-class:' . $class_id . '-activity:' . $activity_id, $request->answers);

        return redirect()->route('class.activity.comparator', [
            'class_id' => $class_id,
            'activity_id' => $activity_id,
            'answer_index' => $answer_index,
        ]);
    }

    public function show_answers($class_id, $activity_id, $student_id)
    {
        $answer = fn() => ActivitiesAnswer::find(Hashids::decode($activity_id)[0]);

        return Inertia::render('Auth/InstructorAndStudent/ClassShowAnswers', [
            'id' => $class_id,
            'activity_id' => $activity_id,
            'student_id' => $student_id,
            'questions' => function () use ($answer, $activity_id) {

                $questions = $answer()->classes;

                $total_points = 0;
                foreach ($questions['questions'] as $question) {
                    if ($question['points'] != null) {
                        $total_points += $question['points'];
                    }
                }

                return [
                    'questions' => $questions,
                    'total_points' => $total_points,
                ];
            },
            'answers' => function () use ($answer) {

                $ans = $answer();

                return [
                    'answers' => [
                        'id' => $ans['answers']['id'],
                        'data' => $ans['answers']['data'],
                    ],
                    'checks' => ActivitiesChecks::where('answer_id', $ans['id'])->first(),
                ];
            },
        ]);
    }
}
