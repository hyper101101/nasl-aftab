<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $fillable = [
        'URL',
        'Action',
        'user_id',
        'how_many_seen',
    ];
}
