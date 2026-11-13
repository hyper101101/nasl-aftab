<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id';

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $fillable = [
        'name',
        'username',
        'phone',
        'password',
        'sign_up_at',
    ];

    protected $casts = [
        'phone_verified_at' => 'datetime',
        'password' => 'hashed',
        'sign_up_at' => 'date',
    ];

    public function favoriteProducts()
    {
        return $this->belongsToMany(Product::class, 'favorites')
            ->withTimestamps();
    }

    public function orders() : HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function author(): MorphMany
    {
        return $this->morphMany(Comment::class, 'author');
    }
}
