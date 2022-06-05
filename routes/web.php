<?php

use App\Http\Controllers\ActivitiesAnswerController;
use App\Http\Controllers\ActivitiesChecksController;
use App\Http\Controllers\AnnouncementsController;
use App\Http\Controllers\ClassesActivitiesController;
use App\Http\Controllers\ClassesController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\User\AdminController;
use App\Http\Controllers\User\InstructorController;
use App\Http\Controllers\User\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::get('/user/edit/{user_id}', [UserController::class, 'edit']);
    Route::get('/password/change', [AdminController::class, 'password']);
    // POST
    Route::post('/user/create', [UserController::class, 'store']);
    Route::post('/user/delete/{user_id}', [UserController::class, 'destroy']);
    Route::post('/user/edit/{user_id}', [UserController::class, 'update']);
    Route::post('/password/change', [AdminController::class, 'password_update']);
});

// Role: Instructor
Route::group(['middleware' => ['auth', 'role:instructor']], function () {
    // GET
    Route::get('/instructor/dashboard', [InstructorController::class, 'index'])->name('instructor.dashboard');
    Route::get('/class/create', [InstructorController::class, 'create_class']);
    Route::get('/class/edit/{class_id}', [ClassesController::class, 'edit']);
    Route::get('/class/{class_id}/students/add', [ClassesController::class, 'show_add_students']);
    Route::get('/class/{class_id}/activity/create/{import_id?}', [ClassesActivitiesController::class, 'index'])->name('instructor.activity.create');
    Route::get('/class/{class_id}/activity/import', [ClassesActivitiesController::class, 'import_index']);
    Route::get('/class/{class_id}/activity/view/{activity_id}', [ClassesActivitiesController::class, 'view']);
    Route::get('/class/{class_id}/activity/report/{activity_id}', [ClassesActivitiesController::class, 'show_report']);
    Route::get('/class/{class_id}/announcement/edit/{announcement_id}', [AnnouncementsController::class, 'edit']);
    // POST
    Route::post('/class/create', [ClassesController::class, 'store']);
    Route::post('/class/edit/{class_id}', [ClassesController::class, 'update']);
    Route::post('/class/delete/{class_id}', [ClassesController::class, 'destroy']);
    Route::post('/class/{class_id}/students/add', [ClassesController::class, 'store_add_students']);
    Route::post('/class/{class_id}/students/remove', [ClassesController::class, 'remove_students']);
    Route::post('/class/{class_id}/activity/create', [ClassesActivitiesController::class, 'store']);
    Route::post('/class/{class_id}/activity/delete/{activity_id}', [ClassesActivitiesController::class, 'destroy']);
    Route::post('/class/{class_id}/activity/import', [ClassesActivitiesController::class, 'import_redirect']);
    Route::post('/class/{class_id}/activity/{activity_id}/show/{student_id}', [ActivitiesChecksController::class, 'store']);
    Route::post('/class/{class_id}/announcement/create', [AnnouncementsController::class, 'store']);
    Route::post('/class/{class_id}/announcement/delete/{announcement_id}', [AnnouncementsController::class, 'destroy']);
    Route::post('/class/{class_id}/announcement/edit/{announcement_id}', [AnnouncementsController::class, 'update']);
});

// Role: Student
Route::group(['middleware' => ['auth', 'role:student']], function () {
    // GET
    Route::get('/no-class-yet', [StudentController::class, 'index'])->name('class.unregistered');
    Route::get('/class/{class_id}/activity/{activity_id}', [ClassesActivitiesController::class, 'answer_activity'])->name('class.activity');
    Route::get('/class/{class_id}/activity/{activity_id}/comparator/{answer_index}', [ClassesActivitiesController::class, 'comparator'])->name('class.activity.comparator');
    // POST
    Route::post('/class/{class_id}/activity/{activity_id}/index/{answer_index}', [ActivitiesAnswerController::class, 'restore_answers']);
    Route::post('/class/{class_id}/activity/{activity_id}/comparator/{answer_index}', [ActivitiesAnswerController::class, 'store_answer_cache']);
    Route::post('/class/{class_id}/activity/{activity_id}', [ActivitiesAnswerController::class, 'store']);
});

// Role: Instructor and Student
Route::group(['middleware' => ['auth', 'role:instructor|student']], function () {
    // GET
    Route::get('/class/overview/{class_id}', [ClassesController::class, 'index'])->name('class.overview');
    Route::get('/class/overview/{class_id}/progress/{student_id?}/{activity_id?}', [ClassesController::class, 'view_progress'])->name('class.overview.progress');
    Route::get('/profile/edit', [ProfileController::class, 'index'])->name('user.profile.edit');
    Route::get('/class/{class_id}/students/view', [ClassesController::class, 'view_students'])->name('class.students.view');
    Route::get('/class/{class_id}/activity/{activity_id}/show/{student_id}', [ActivitiesAnswerController::class, 'show_answers']);
    Route::get('/class/{class_id}/announcement/view/{announcement_id}', [AnnouncementsController::class, 'index'])->name('class.announcement.view');
    // POST
    Route::post('/profile/edit', [ProfileController::class, 'store_or_update']);
});

// Authenticated middlewares
Route::group(['middleware' => ['auth']], function () {
    // GET
    Route::get('/', [UserController::class, 'index']);
    // POST
    Route::post('/logout', [UserController::class, 'logout']);
});
