<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Cart;
use App\Models\CartItem;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Conversation;

class ProductController extends Controller
{
    public function getProducts(string $category)
    {
        $databaseCategory = match ($category) {
            'zereshk' => 'zereshk',
            'gol-mohammadi' => 'gol-mohammadi',
            'zaferan' => 'saffron',
            default => $category,
        };

        $products = Product::where('category', $databaseCategory)
            ->get()
            ->map(fn($product) => [
                'id' => (int) $product->id,
                'code' => (string) ($product->code ?? ''),
                'slug' => (string) ($product->slug ?? ''),
                'name' => (string) $product->name,

                'category' => match ($product->category) {
                    'zereshk' => 'barberry',
                    'gol-mohammadi' => 'rose',
                    'saffron' => 'zaferan',
                    default => 'other',
                },

                'grade' => (string) ($product->quality ?? ''),
                'variety' => $product->type,
                'description' => (string) ($product->description ?? ''),
                'price' => (int) $product->price,
                'unit' => (string) ($product->sale_unit ?? ''),
                'wholesale' => in_array(
                    $product->package_type,
                    ['wholesale', 'عمده'],
                    true
                ),
                'featured' => (bool) ($product->show_first_page ?? false),
                'image' => $product->image
                    ? asset('storage/' . $product->image)
                    : null,
                'stock' => (int) ($product->stock ?? 0),
                'special' => (bool) ($product->is_special_offer ?? false),
                'discount' => (int) ($product->discount_percent ?? 0),
            ]);

        return Inertia::render('products', [
            'category' => $category,
            'products' => $products,
        ]);
    }


    public function getProduct(string $category, string $slug)
    {
        $databaseCategory = match ($category) {
            'zaferan' => 'saffron',
            default => $category,
        };

        $product = Product::where([
            'category' => $databaseCategory,
            'slug' => $slug,
        ])->firstOrFail();

        $user = Auth::guard('web')->user();

        $isFavorite = $user instanceof User
            && $user->favoriteProducts()
            ->where('products.id', $product->id)
            ->exists();

        $productData = $product->toArray();

        $productData['grade'] = $product->quality;
        $productData['unit'] = $product->sale_unit;

        $productData['image'] = $product->image
            ? asset('storage/' . ltrim($product->image, '/'))
            : null;

        /*
    |--------------------------------------------------------------------------
    | گفت‌وگوی کاربر درباره این محصول
    |--------------------------------------------------------------------------
    */

        $conversation = null;
        $messages = collect();

        if ($user instanceof User) {
            $conversation = Conversation::query()
                ->where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->whereIn('status', ['pending', 'open'])
                ->latest('updated_at')
                ->first();

            if ($conversation) {
                $messages = $conversation->messages()
                    ->orderBy('created_at')
                    ->orderBy('id')
                    ->get()
                    ->map(fn($message) => [
                        'id' => (int) $message->id,
                        'body' => (string) $message->body,
                        'created_at' => $message->created_at?->toISOString(),
                        'sender_type' => $message->sender_type,
                        'sender_id' => (int) $message->sender_id,
                    ])
                    ->values();
            }
        }

        /*
    |--------------------------------------------------------------------------
    | نظرات محصول
    |--------------------------------------------------------------------------
    */

        $reviewQuery = \App\Models\Comment::query()
            ->whereNull('parent_id')
            ->where('product_id', $product->id)
            ->where('author_type', 'user');

        $reviews = (clone $reviewQuery)
            ->approved()
            ->with('author')
            ->latest()
            ->get()
            ->map(fn($comment) => [
                'id' => (int) $comment->id,
                'userId' => (int) $comment->author_id,
                'rating' => (int) $comment->rating,
                'comment' => $comment->body,
                'author' => $comment->author?->name ?? 'کاربر',
                'createdAt' => $comment->created_at?->toISOString(),
            ])
            ->values();

        $myReview = null;

        if ($user instanceof User) {
            $myReview = (clone $reviewQuery)
                ->where('author_id', $user->id)
                ->where('status', '!=', 'rejected')
                ->first();

            if ($myReview) {
                $myReview = [
                    'id' => (int) $myReview->id,
                    'userId' => (int) $myReview->author_id,
                    'rating' => (int) $myReview->rating,
                    'comment' => $myReview->body,
                    'author' => $user->name ?? 'کاربر',
                    'createdAt' => $myReview->created_at?->toISOString(),
                    'status' => $myReview->status,
                ];
            }
        }

        $reviewCount = $reviews->count();

        $reviewSummary = [
            'count' => $reviewCount,
            'average' => $reviewCount > 0
                ? round($reviews->avg('rating'), 1)
                : 0,
            'distribution' => collect(range(1, 5))
                ->mapWithKeys(fn($rating) => [
                    $rating => $reviews->where('rating', $rating)->count(),
                ]),
        ];

        return Inertia::render('product', [
            'category' => $category,
            'product' => $productData,
            'isFavorite' => $isFavorite,
            'reviews' => $reviews,
            'reviewSummary' => $reviewSummary,
            'myReview' => $myReview,

            'currentUser' => $user instanceof User
                ? [
                    'id' => (int) $user->id,
                    'name' => $user->name,
                ]
                : null,

            'conversation' => $conversation
                ? [
                    'id' => (int) $conversation->id,
                    'status' => $conversation->status,
                    'product_id' => (int) $conversation->product_id,
                    'last_message_at' => $conversation->last_message_at?->toISOString(),
                ]
                : null,

            'messages' => $messages,
        ]);
    }

    public function addToCart(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $cart = Cart::current();

        $item = $cart->items()->firstOrNew([
            'product_id' => $data['product_id'],
        ]);

        $item->quantity = ($item->exists ? $item->quantity : 0)
            + $data['quantity'];

        $item->save();

        return back()->with('success', 'کالا به سبد خرید اضافه شد!');
    }
}
