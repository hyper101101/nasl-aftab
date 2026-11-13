<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockSubscription extends Model
{
    protected $fillable = ['user_id', 'product_id', 'notified_at'];
}
