<?php
//
//
//
//use Illuminate\Support\Facades\Storage;
//{
//    public function index()
//    {
//        $articles = Article::query()
//            ->select('id', 'title', 'author', 'image', 'created_at')
//            ->with('viewCount:article_id,view_count')
//            ->latest()
//            ->paginate(10);
//
//        return Inertia::render('admin/articles/Index', [
//            'articles' => $articles,
//        ]);
//    }
//
//    public function create()
//    {
//        return Inertia::render('admin/articles/Create');
//    }
//
//    public function store(Request $request)
//    {
//        $validated = $request->validate([
//            'title' => ['required', 'string', 'max:255'],
//            'body' => ['required', 'string'],
//            'author' => ['required', 'string', 'max:255'],
//            'image' => ['nullable', 'image', 'max:5120'],
//        ]);
//
//        if ($request->hasFile('image')) {
//            $validated['image'] = $request->file('image')
//                ->store('articles', 'public');
//        }
//
//        $article = Article::create($validated);
//
//        ArticleViewCount::create([
//            'article_id' => $article->id,
//        ]);
//
//        return redirect()
//            ->route('admin.articles.index')
//            ->with('success', 'مقاله با موفقیت ایجاد شد.');
//    }
//
//    public function edit(string $name, string $token, Article $article)
//    {
//        return Inertia::render('admin/articles/Edit', [
//            'article' => $article,
//        ]);
//    }
//
//    public function update(Request $request, string $name, string $token, Article $article)
//    {
//        $validated = $request->validate([
//            'title' => ['required', 'string', 'max:255'],
//            'body' => ['required', 'string'],
//            'author' => ['required', 'string', 'max:255'],
//            'image' => ['nullable', 'image', 'max:5120'],
//        ]);
//
//        if ($request->hasFile('image')) {
//            if ($article->image) {
//                \Illuminate\Support\Facades\Storage::disk('public')->delete($article->image);
//            }
//
//            $validated['image'] = $request->file('image')->store('articles', 'public');
//        }
//
//        $article->update($validated);
//
//        return redirect()
//            ->route('admin.articles.index', [
//                'name' => $name,
//                'token' => $token,
//            ])
//            ->with('success', 'مقاله با موفقیت ویرایش شد.');
//    }
//
//    public function destroy(string $name, string $token, Article $article)
//    {
//        if ($article->image) {
//            Storage::disk('public')->delete(
//                preg_replace('#^/?storage/#', '', $article->image)
//            );
//        }
//
//        $views = ArticleViewCount::firstOrFail('article_id', $article->id);
//        $views->delete();
//        $article->delete();
//
//        return redirect()
//            ->route('admin.articles.index')
//            ->with('success', 'مقاله با موفقیت حذف شد.');
//    }
//}
namespace App\Http\Controllers;
use App\Models\Article;
use App\Models\ArticleViewCount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminArticleController extends Controller
{
    public function index()
    {
        $articles = Article::query()
            ->select('id', 'title', 'author', 'image', 'created_at')
            ->with('viewCount:article_id,view_count')
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/articles/Index', ['articles' => $articles]);
    }

    public function create()
    {
        return Inertia::render('admin/articles/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'  => ['required', 'string', 'max:255'],
            'body'   => ['required', 'string'],
            'author' => ['required', 'string', 'max:255'],
            'image'  => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('articles', 'public');
        }

        DB::transaction(function () use ($validated) {
            $article = Article::create($validated);
            ArticleViewCount::create(['article_id' => $article->id]);
        });

        return redirect()->route('admin.articles.index')
            ->with('success', 'مقاله با موفقیت ایجاد شد.');
    }

    public function edit(Article $article)
    {
        return Inertia::render('admin/articles/Edit', ['article' => $article]);
    }

    public function update(Request $request, Article $article)
    {
        $validated = $request->validate([
            'title'  => ['required', 'string', 'max:255'],
            'body'   => ['required', 'string'],
            'author' => ['required', 'string', 'max:255'],
            'image'  => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $oldImage = null;

        if ($request->hasFile('image')) {
            $oldImage = $article->image;
            $validated['image'] = $request->file('image')->store('articles', 'public');
        } else {
            unset($validated['image']);
        }

        $article->update($validated);

        if ($oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        return redirect()->route('admin.articles.index')
            ->with('success', 'مقاله با موفقیت ویرایش شد.');
    }

    public function destroy(Article $article)
    {
        $image = $article->image;

        DB::transaction(function () use ($article) {
            ArticleViewCount::where('article_id', $article->id)->delete();
            $article->delete();
        });

        if ($image) {
            Storage::disk('public')->delete(preg_replace('#^/?storage/#', '', $image));
        }

        return redirect()->route('admin.articles.index')
            ->with('success', 'مقاله با موفقیت حذف شد.');
    }
}
