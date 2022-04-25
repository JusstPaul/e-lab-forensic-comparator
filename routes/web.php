<?php

use App\Http\Controllers\ActivitiesAnswerController;
use App\Http\Controllers\ClassesActivitiesController;
use App\Http\Controllers\ClassesController;
use App\Http\Controllers\ClassesStudentsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\Classes;
use App\Models\ClassesStudents;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

// Guest middlewares
Route::group(['middleware' => ['guest']], function () {
    // GET
    Route::get('/login', fn() => Inertia::render('Guest/Login'))->name('login');

    // POST
    Route::post('/login', [UserController::class, 'authenticate']);
});

// Role: Admin
Route::group(['middleware' => ['auth', 'role:admin']], function () {
    // GET
    Route::get('/admin/dashboard', [UserController::class, 'show_admin'])->name('admin.dashboard');
    Route::get('/user/create', [UserController::class, 'show_create'])->name('admin.user.create');

    // POST
    Route::post('/user/create', [UserController::class, 'store']);
    Route::post('/user/delete/{user_id}', [UserController::class, 'destroy']);
});

// Role: Instructor
Route::group(['middleware' => ['auth', 'role:instructor']], function () {
    // GET
    Route::get('/instructor/dashboard', [UserController::class, 'show_instructor'])->name('instructor.dashboard');
    Route::get('/class/create', [ClassesController::class, 'show_create']);
    Route::get('/class/{class_id}/students/add', [ClassesController::class, 'show_add']);
    Route::get('/class/{class_id}/activity/create', [ClassesActivitiesController::class, 'show']);
    Route::get('/class/{class_id}/activity/{answer_id}/check', [ActivitiesAnswerController::class, 'show'])->name('class.activity.check');

    // POST
    Route::post('/class/create', [ClassesController::class, 'store']);
    Route::post('/class/{class_id}/students/add', [ClassesStudentsController::class, 'store']);
    Route::post('/class/{class_id}/activity/create', [ClassesActivitiesController::class, 'store']);
    Route::post('/class/{class_id}/activity/{activity_id}/check', [ClassesActivitiesController::class, 'store_check']);
});

// Role: Student
Route::group(['middleware', ['auth', 'role:student']], function () {
    // GET
    Route::get('/no-class-yet', [UserController::class, 'show_student_unregistered'])->name('class.unregistered');
    Route::get('/class/{class_id}/activity/{activity_id}', [ActivitiesAnswerController::class, 'show_to_answer'])->name('class.activity');
    Route::get('/class/{class_id}/activity/{activity_id}/comparator/{answer_index}', [ActivitiesAnswerController::class, 'show_to_answer_controller'])->name('class.activity.comparator');

    // POST
    Route::post('/class/{class_id}/activity/{activity_id}', [ActivitiesAnswerController::class, 'store']);
});

// Role: Instructor and Student
Route::group(['middleware' => ['auth', 'role:instructor|student']], function () {
    // GET
    Route::get('/class/overview/{class_id}', [ClassesController::class, 'show'])->name('class.overview');
    Route::get('/class/{class_id}/overview/progress/{student_id?}/{activity_id?}', [ClassesController::class, 'show_progress'])->name('class.overview.progress');
    Route::get('/profile/edit', [ProfileController::class, 'show'])->name('user.profile.edit');
    Route::get('/class/{class_id}/students/view', [ClassesController::class, 'show_students']);

    // POST
    Route::post('/profile/edit', [ProfileController::class, 'store_or_update']);
});

// Authenticated middlewares
Route::group(['middleware' => ['auth']], function () {
    // GET
    Route::get('/', function () {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        } else if ($user->hasRole('instructor')) {
            return redirect()->route('instructor.dashboard');
        } else {
            if ($user->profile == null) {
                return redirect()->route('user.profile.edit');
            }

            $classes = ClassesStudents::where('student_id', $user->id)
                ->get()
                ->first();

            if ($classes == null) {
                return redirect()->route('class.unregistered');
            }

            return redirect()->route('class.overview', [
                'class_id' => Hashids::encode($classes->classes->id),
            ]);
        }
    });

    Route::get('/store', function (Request $request) {
        return Storage::disk('s3')->get($request->file);
    })->name('s3.store');

    // POST
    Route::post('/logout', [UserController::class, 'logout']);

});
