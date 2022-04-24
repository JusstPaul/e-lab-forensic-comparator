<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivitiesAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'answers',
        'is_checked',
        'score',
        'activity_id',
        'student_id',
    ];

    protected $casts = [
        'answers' => 'array',
        'is_checked' => 'boolean',
    ];

    public function activities()
    {
        return $this->belongsTo(ClassesActivities::class, 'activity_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
