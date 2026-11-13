<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{


    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_code',
        'quantity',
        'line_total',
    ];

    protected $hidden = [
        'order_id',
        'product_id',
    ];

    public function casts(): array
    {
        return [
            'line_total' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
