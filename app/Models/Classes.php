<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classes extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'room',
        'day',
        'time_start',
        'time_end',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function students()
    {
        return $this->hasMany(ClassesStudents::class, 'classes_id');
    }

    public function activities()
    {
        return $this->hasMany(ClassesActivities::class, 'classes_id');
    }
}
