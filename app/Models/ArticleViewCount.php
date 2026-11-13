<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleViewCount extends Model
{
    protected $fillable = [
        'article_id',
        'view_count',
    ];

    protected $hidden = [
        'id'
    ];

    public function article() : BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
