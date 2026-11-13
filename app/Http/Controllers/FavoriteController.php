<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function toggle(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);
        $result = $request->user()->favoriteProducts()->toggle($data['product_id']);

        $added = count($result['attached']) > 0;

        return back()->with('success', $added
            ? 'به علاقه مندی ها اضافه شد!'
            : 'از علاقه مندی ها حذف شد!');
    }

    public function index(Request $request)
    {
        $products = $request->user()->favoriteProducts()->latest('favorites.created_at')->get();
        return Inertia::render('Favorites/Index', ['products' => $products]);
    }
}
