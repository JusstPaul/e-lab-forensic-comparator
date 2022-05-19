<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivitiesAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'answers',
        'activity_id',
        'student_id',
    ];

    protected $casts = [
        'answers' => 'array',
    ];

    public function classes()
    {
        return $this->belongsTo(ClassesActivities::class, 'activity_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function checks()
    {
        return $this->hasOne(ActivitiesChecks::class, 'answer_id');
    }
}
