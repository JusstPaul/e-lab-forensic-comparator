<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassesActivities extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'date_end',
        'time_end',
        'questions',
    ];

    protected $casts = [
        'questions' => 'array',
    ];

    public function classes()
    {
        return $this->belongsTo(Classes::class, 'classes_id');
    }

    public function activities()
    {
        return $this->hasMany(ActivitiesAnswer::class, 'activity_id');
    }
}
