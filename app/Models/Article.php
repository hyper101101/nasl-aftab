<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Article extends Model
{
    protected $table = 'articles';

    protected $fillable = [
        'title',
        'body',
        'author',
        'image',
    ];

    public function viewCount(): HasOne
    {
        return $this->hasOne(ArticleViewCount::class, 'article_id');
    }
}
