<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'product_id',
        'parent_id',
        'rating',
        'body',
        'status',
    ];
    protected $hidden = [
        'author_type',
        'author_id',
        'before_edit',
        'status',
        'approved_at',
        'approved_by',
        'rejected_at',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'edited_at'   => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    public function author(): MorphTo
    {
        return $this->morphTo()->withTrashed();
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(CommentReaction::class);
    }

    public function scopeApproved($q)
    {
        return $q->where('status', 'approved');
    }

    public function scopeRoots($q)
    {
        return $q->whereNull('parent_id');
    }
}
