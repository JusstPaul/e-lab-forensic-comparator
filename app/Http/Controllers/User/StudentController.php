<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        if (auth()->user()->joined_classes) {
            return redirect('/');
        }
        return Inertia::render('Auth/Student/NoClass');
    }
}
