<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcements extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'files',
    ];

    protected $casts = [
        'files' => 'array',
    ];

    public function owner()
    {
        return $this->belongsTo(Classes::class, 'id');
    }
}
