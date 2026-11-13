<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleViewCount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $articles = article::query()
            ->latest()
            ->select('id', 'title', 'author', 'image', 'created_at')
            ->with('viewCount:article_id,view_count')
            ->paginate(9);

        return Inertia::render('blog/Index', [
            'articles' => $articles,
        ]);
    }

    public function show(int $id): Response
    {
        $article = Article::with('viewCount:article_id,view_count')
            ->findOrFail($id);

        $viewCount = ArticleViewCount::firstOrCreate(
            ['article_id' => $article->id],
            ['view_count' => 0]
        );

        $viewCount->increment('view_count');

        return Inertia::render('blog/Show', [
            'article' => $article,
            'view_count' => $viewCount->view_count,
        ]);
    }

}
