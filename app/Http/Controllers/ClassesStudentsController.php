<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassesStudents;
use Illuminate\Http\Request;
use Vinkla\Hashids\Facades\Hashids;

class ClassesStudentsController extends Controller
{
    public function store(Request $request, $class_id)
    {
        $request->validate([
            'selected' => 'required|array',
        ]);

        $classes = Classes::find(Hashids::decode($class_id)[0]);
        $record = [];

        foreach ($request->selected as $selected) {
            $entry = new ClassesStudents;
            $entry->student_id = Hashids::decode($selected)[0];

            array_push($record, $entry);
        }

        $classes->students()->saveMany($record);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }
}
