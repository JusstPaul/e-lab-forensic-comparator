<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use Illuminate\Http\Request;
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
}
