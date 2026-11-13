<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCounter extends Model
{
    protected $table = 'productcounter';
    protected $fillable = [
        'category',
        'last_number',
        'created_at',
        'updated_at',
    ];
}
