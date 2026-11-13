<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Observers\ProductObserver;

#[ObservedBy(ProductObserver::class)]
class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'category',
        'name',
        'description',
        'price',
        'code',
        'quality',
        'type',
        'sale_unit',
        'package_type',
        'provider',
        'is_special_offer',
        'discount_percent',
        'stock',
        'min_order_quantity',
        'image',
        'show_first_page',
        'slug',
        'is_available',
        'created_at',
        'updated_at',
    ];
}
