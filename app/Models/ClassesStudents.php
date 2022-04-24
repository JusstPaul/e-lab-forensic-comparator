<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassesStudents extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
    ];

    public function classes()
    {
        return $this->belongsTo(Classes::class, 'classes_id');
    }

    public function students()
    {
        return $this->hasMany(User::class, 'id');
    }

}
