<?php

namespace App\Http\Controllers;

use App\Models\Announcements;
use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Vinkla\Hashids\Facades\Hashids;

class AnnouncementsController extends Controller
{
    public function store(Request $request, $class_id)
    {
        $result = $request->validate([
            'text' => 'required',
            'files' => 'nullable|array',
            'files.*' => 'file',
        ]);
        $files = [];

        if ($result['files'] != null) {
            $files = array_map(function ($file) use ($class_id) {
                return Storage::disk('s3')
                    ->put('class/instructor/announcements/' . $class_id . '/' . $file->getClientOriginalName(), $file);
            }, $result['files']);
        }

        $announcement = new Announcements;
        $announcement->text = $result['text'];
        $announcement->files = $files;

        Classes::find(Hashids::decode($class_id)[0])->announcements()->save($announcement);

        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }

    public function index($class_id, $announcement_id)
    {
        return Inertia::render('Auth/InstructorAndStudent/ClassViewAnnouncement', [
            'id' => $class_id,
            'announcement' => function () use ($announcement_id) {
                $announcement = Announcements::find(Hashids::decode($announcement_id)[0]);
                $files = [];

                foreach ($announcement->files as $file) {
                    array_push($files, $file);
                }

                return [
                    'id' => Hashids::encode($announcement->id),
                    'text' => $announcement->text,
                    'files' => $files,
                    'created_at' => $announcement->created_at,
                ];
            },
        ]);
    }

    public function edit($class_id, $announcement_id)
    {
        return Inertia::render('Auth/Instructor/ClassEditAnnouncement', [
            'id' => $class_id,
            'announcement' => function () use ($announcement_id) {
                return [
                    'id' => $announcement_id,
                    'text' => fn() => Announcements::find(Hashids::decode($announcement_id)[0])->text,
                ];
            },
        ]);
    }

    public function update(Request $request, $class_id, $announcement_id)
    {
        $request->validate([
            'text' => 'required',
        ]);

        $announcement = Announcements::find(Hashids::decode($announcement_id)[0]);
        $announcement->text = $request->text;
        $announcement->save();

        return redirect()->route('class.announcement.view', [
            'announcement_id' => $announcement_id,
            'class_id' => $class_id,
        ]);
    }

    public function destroy($class_id, $announcement_id)
    {
        Announcements::destroy(Hashids::decode($announcement_id)[0]);
        return redirect()->route('class.overview', [
            'class_id' => $class_id,
        ]);
    }
}
