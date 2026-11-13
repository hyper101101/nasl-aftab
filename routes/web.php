<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\VerifyAdminUrl;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\AdminPanelController;
use App\Http\Middleware\VerifyAdminRole;
use App\Http\Controllers\OrderController;
use App\Models\Product;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\AdminArticleController;
// صفحه اصلی
Route::get('/', function () {
    $products = Product::where('is_available', true)
        ->where('show_first_page', true)
        ->latest()
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
            'variety' => (string) ($product->type ?? ''),
            'description' => (string) ($product->description ?? ''),
            'price' => (int) $product->price,
            'unit' => (string) ($product->sale_unit ?? ''),

            'wholesale' => in_array(
                $product->package_type,
                ['wholesale', 'عمده'],
                true
            ),

            'featured' => (bool) $product->show_first_page,

            'image' => $product->image
                ? asset('storage/' . ltrim($product->image, '/'))
                : null,

            'stock' => (int) ($product->stock ?? 0),
            'special' => (bool) ($product->is_special_offer ?? false),
            'discount' => (int) ($product->discount_percent ?? 0),
        ])
        ->values();

    return Inertia::render('home', [
        'featuredProducts' => $products,
    ]);
})->name('home.page');

// ورود مدیر از آدرس ثابت
Route::middleware('guest:admin')->group(function () {
    Route::get('/admin-login', [AdminController::class, 'showAdminLoginForm'])
        ->name('admin.login.fixed');

    Route::post('/admin-login', [AdminController::class, 'adminLoginByCredentials'])
        ->middleware('throttle:6,1')
        ->name('admin.login.fixed.submit');
});

// روت‌های مدیریت
Route::middleware([VerifyAdminUrl::class])
    ->prefix('admin-{name}/{token}')
    ->name('admin.')
    ->group(function () {

        // ورود ادمین
        Route::middleware('guest:admin')->group(function () {
            Route::get('/login', [AdminController::class, 'showAdminLoginForm'])
                ->name('login.form');

            Route::post('/login', [AdminController::class, 'adminLogin'])
                ->middleware('throttle:6,1')
                ->name('login');
        });

        // ادمین و سوپرادمین
        Route::middleware('auth:admin')->group(function () {
            Route::get('/panel', [AdminController::class, 'getData'])
                ->name('panel');

            Route::get('/panel/comments', [AdminPanelController::class, 'getComments'])
                ->name('comments');

            Route::post('/logout', [AdminController::class, 'adminLogout'])
                ->name('logout');

            Route::post('/comment/{comment}/approve', [AdminPanelController::class, 'approveComment'])
                ->name('comment.approve');

            Route::post('/comment/{comment}/reject', [AdminPanelController::class, 'rejectComment'])
                ->name('comment.reject');

            Route::post('/admin/products/add', [AdminController::class, 'storeProduct'])
                ->name('products.store');

            Route::put('/admin/product/{product}/edit', [AdminController::class, 'editProduct'])
                ->name('products.edit');

            Route::delete('/admin/product/{product}/delete', [AdminController::class, 'deleteProduct'])
                ->name('products.delete');
            // مدیریت مقالات وبلاگ
            Route::get('/admin/articles', [AdminArticleController::class, 'index'])
                ->name('articles.index');

            Route::get('/admin/articles/create', [AdminArticleController::class, 'create'])
                ->name('articles.create');

            Route::post('/admin/articles', [AdminArticleController::class, 'store'])
                ->name('articles.store');

            Route::get('/admin/articles/{article}/edit', [AdminArticleController::class, 'edit'])
                ->name('articles.edit');

            Route::put('/admin/articles/{article}', [AdminArticleController::class, 'update'])
                ->name('articles.update');

            Route::delete('/admin/articles/{article}', [AdminArticleController::class, 'destroy'])
                ->name('articles.destroy');
        });

        // سوپرادمین
        Route::middleware([VerifyAdminRole::class, 'auth:admin'])
            ->prefix('super')
            ->name('super.')
            ->group(function () {
                Route::get('/', [AdminPanelController::class, 'getSuperAdminData'])
                    ->name('data');

                Route::post('/admins', [AdminPanelController::class, 'newAdmin'])
                    ->name('admin.admin.add');

                Route::put('/admins/{admin}', [AdminPanelController::class, 'editAdmin'])
                    ->name('admin.admin.edit');

                Route::delete('/admins/{admin}', [AdminPanelController::class, 'deleteAdmin'])
                    ->name('admin.admin.delete');
            });
    });


// افزودن به سبد خرید
Route::post('/products/add/to-cart', [ProductController::class, 'addToCart'])
    ->name('products.add.to.cart');


// ورود کاربر
Route::get('/login', [UserController::class, 'showLoginForm'])
    ->name('login.page');

Route::post('/login', [UserController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('login');

Route::post('/logout', [UserController::class, 'logout'])
    ->name('logout');


// ثبت‌نام کاربر
Route::get('/register', [UserController::class, 'showRegisterForm'])
    ->name('register');

Route::post('/register', [UserController::class, 'register'])
    ->middleware('throttle:5,1')
    ->name('register');


// روت‌های محصولات
Route::get('/products/{category}/{slug}', [ProductController::class, 'getProduct'])
    ->whereIn('category', ['zereshk', 'gol-mohammadi', 'zaferan', 'other']);

Route::redirect('/products', '/products/zereshk');

Route::get('/products/{category}', [ProductController::class, 'getProducts'])
    ->whereIn('category', ['zereshk', 'gol-mohammadi', 'zaferan', 'other']);


// محصولات موردعلاقه
Route::middleware('auth')->group(function () {
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])
        ->name('favorites.toggle');

    Route::get('/favorites', [FavoriteController::class, 'index'])
        ->name('favorites.index');
});


// کامنت‌ها
Route::middleware(['auth:web,admin', 'throttle:10,1'])
    ->prefix('comment')
    ->name('comment.')
    ->group(function () {
        Route::post('/new', [CommentController::class, 'newComment'])
            ->name('new');

        Route::post('/reply', [CommentController::class, 'replyComment'])
            ->name('reply');

        Route::put('/edit/{comment}', [CommentController::class, 'updateComment'])
            ->name('edit');

        Route::put('/replies/edit/{comment}', [CommentController::class, 'updateReply'])
            ->name('reply.edit');

        Route::delete('/delete/{comment}', [CommentController::class, 'deleteComment'])
            ->name('delete');

        Route::post('/{comment}/thumbs', [CommentController::class, 'thumbs'])
            ->name('thumbs');
    });


// روت‌های چت
Route::prefix('chat')->name('chat.')->group(function () {

    // روت‌های ادمین
    Route::middleware('auth:admin')->group(function () {
        Route::get('/list', [ChatController::class, 'chatList'])
            ->name('list');

        Route::get('/{chat}', [ChatController::class, 'chat'])
            ->name('chat');

        // دریافت پیام‌های جدید ادمین برای polling
        Route::get('/{chat}/messages', [ChatController::class, 'adminMessages'])
            ->name('messages.admin');

        Route::post('/{chat}/close', [ChatController::class, 'closeChat'])
            ->name('chat.close');

        Route::post('/{chat}/reception', [ChatController::class, 'receptionChat'])
            ->name('chat.reception');

        Route::post('/{chat}/send', [ChatController::class, 'storeAdminMessage'])
            ->name('admin.send');

        Route::put('/{chat}/edit', [ChatController::class, 'editAdminMessage'])
            ->name('admin.edit');

        Route::delete('/{chat}/delete', [ChatController::class, 'deleteAdminMessage'])
            ->name('admin.delete');
    });

    // روت‌های مشتری
    Route::middleware('auth:web')
        ->prefix('{product}')
        ->group(function () {
            Route::post('/new', [ChatController::class, 'newChat'])
                ->name('new');

            Route::post('/{chat}/send', [ChatController::class, 'storeMessage'])
                ->name('send');

            Route::put('/{chat}/edit', [ChatController::class, 'editMessage'])
                ->name('edit');

            Route::delete('/{chat}/delete', [ChatController::class, 'deleteMessage'])
                ->name('delete');

            // دریافت پیام‌های جدید مشتری برای polling
            Route::get('/{chat}/messages', [ChatController::class, 'customerMessages'])
                ->name('messages.customer');
        });
});


// روت‌های سفارش
Route::prefix('/order')->name('order.')->group(function () {

    // روت‌های مشتری
    Route::middleware('auth:web')->group(function () {
        // مسیر بازگشت درگاه پرداخت پس از تأیید پرداخت
        // Route::post('/payment/confirmed', [OrderController::class, 'registerOrder'])->name();
    });

    // روت‌های ادمین
    Route::middleware('auth:admin')->group(function () {});
});


// سبد خرید
Route::get('/cart', function () {
    $products = Product::where('is_available', true)
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
            'variety' => (string) ($product->type ?? ''),
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
                ? asset('storage/' . ltrim($product->image, '/'))
                : null,

            'stock' => (int) ($product->stock ?? 0),
            'special' => (bool) ($product->is_special_offer ?? false),
            'discount' => (int) ($product->discount_percent ?? 0),
        ])
        ->values();

    return Inertia::render('cart', [
        'databaseProducts' => $products,
    ]);
});

//User Dashboard routes
Route::middleware('auth:web')->prefix('/user/dashboard')->name('user.dashboard.')->group(function () {
    Route::get('/', [UserDashboardController::class, 'index']);
    Route::redirect('/cart', '/cart')->name('cart');
    Route::put('/change/password', [UserDashboardController::class, 'changePassword'])->name('change.password');
    Route::put('/change/phone', [UserDashboardController::class, 'changePhone'])->name('change.phone');
    Route::put('/change/username', [UserDashboardController::class, 'changeUsername'])->name('change.username');
    Route::get('/{order}', [UserDashboardController::class, 'orderDetails'])->name('order.details');
    Route::get('/comments', [UserDashboardController::class, 'comments'])->name('comments');
    Route::get('/chat/list', [UserDashboardController::class, 'chatList'])->name('chat.list');
    Route::get('/{chat}/chat', [UserDashboardController::class, 'chat'])->name('chat');
});

Route::get('/profile', fn() => Inertia::render('profile'));
Route::get('/about', fn() => Inertia::render('about'));

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{id}', [BlogController::class, 'show'])
    ->whereNumber('id')
    ->name('blog.show');
