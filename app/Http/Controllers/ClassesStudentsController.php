<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassesStudents;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
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

    public function index($class_id)
    {
        return Inertia::render('Auth/Instructor/ClassAddStudent', [
            'id' => $class_id,
            'students' => function () {
                $students = array_filter(User::role('student')->get()
                        ->map(function ($value) {
                            if (ClassesStudents::where('student_id', $value->id)->first() != null) {
                                return null;
                            }

                            $profile = $value->profile;

                            if ($profile == null) {
                                return null;
                            }

                            return [
                                'id' => Hashids::encode($value->id),
                                'student_id' => $value->username,
                                'name' => $profile->last_name . ', ' . $profile->first_name . ' ' . $profile->middle_name[0] . '.',
                                'contact' => $profile->contact,
                            ];
                        })->toArray(), fn($value) => $value != null);

                $final_students = [];

                foreach ($students as $student) {
                    array_push($final_students, $student);
                }

                return $final_students;
            },
        ]);
    }
}
