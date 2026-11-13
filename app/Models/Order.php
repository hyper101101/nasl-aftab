<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'subtotal',
        'discount_amount',
        'shipping_amount',
    ];

    protected $hidden = [
        'user_id',
    ];

    public function casts(): array
    {
        return [
            'discount_amount' => 'integer',
            'shipping_amount' => 'integer',
            'subtotal' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function OrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
