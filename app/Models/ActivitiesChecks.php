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
    ];

    protected $casts = [
        'checks' => 'array',
    ];

    public function answers()
    {
        return $this->belongsTo(ActivitiesAnswer::class);
    }
}