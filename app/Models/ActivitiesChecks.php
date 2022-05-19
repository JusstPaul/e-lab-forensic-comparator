<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivitiesChecks extends Model
{
    use HasFactory;

    protected $fillable = [
        'score',
        'checks',
        'is_checked',
    ];

    protected $casts = [
        'checks' => 'array',
    ];

    public function parent()
    {
        return $this->belongsTo(ActivitiesAnswer::class);
    }
}
