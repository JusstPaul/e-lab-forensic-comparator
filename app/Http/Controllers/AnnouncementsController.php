<?php

namespace App\Http\Controllers;

use App\Models\Announcements;
use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                    ->put('class/instructor/announcements/' . $class_id . '/', $file);
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
}
