<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use Illuminate\Http\Request;

class ClassesController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'section' => 'required|max:16',
            'room' => 'required|max:10',
            'day' => 'required|in:MWF,TTh,Sat',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'required|date_format:H:i|after:time_start',
        ]);

        $classes = new Classes;
        $classes->code = $request->section;
        $classes->room = $request->room;
        $classes->day = $request->day;
        $classes->time_start = $request->time_start;
        $classes->time_end = $request->time_end;

        auth()->user()->classes()->save($classes);

        return redirect('/');
    }
}
