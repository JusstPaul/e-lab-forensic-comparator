<?php

namespace App\Http\Controllers;

use App\Models\ActivitiesAnswer;
use Illuminate\Http\Request;
use Vinkla\Hashids\Facades\Hashids;

class ActivitiesChecksController extends Controller
{
    public function store(Request $request, $class_id, $activity_id, $student_id)
    {
        $request->validate([
            'checks.score' => 'required|numeric',
            'checks.checks' => 'required|array',
            'checks.checks.*' => 'array',
            'checks.checks.*.isChecked' => 'boolean',
            'checks.checks.*.points' => 'required|numeric',
            'checks.checks.*.hasComment' => 'boolean',
            'checks.checks.*.comment' => 'required_if:checks.checks.*.hasComment,==,true',
        ]);

        $answer = ActivitiesAnswer::where('id', Hashids::decode($activity_id)[0])
            ->where('student_id', Hashids::decode($student_id)[0])
            ->first();

        $answer->checks()->updateOrCreate([
            'answer_id' => $answer->id,
        ], [
            'score' => $request->checks['score'],
            'checks' => $request->checks['checks'],
            'is_checked' => true,
        ]);

        return redirect()->route('class.overview.progress', [
            'activity_id' => $activity_id,
            'class_id' => $class_id,
            'student_id' => $student_id,
        ]);
    }
}
