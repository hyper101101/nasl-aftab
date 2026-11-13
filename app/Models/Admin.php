<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
//use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    //use SoftDeletes;
    protected $fillable = [
        'name',
        'role',
        'username',
        'url_name',
        'password',
        'login_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];
    protected $hidden = [
        'password',
        'login_token',
        'role',
        'remember_token',
    ];

    public function author(): MorphMany
    {
        return $this->morphMany(Comment::class, 'author');
    }
}
