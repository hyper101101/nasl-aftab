<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Product;
use App\Models\ProductCounter;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    private function adminRouteParams(Request $request): array
    {
        return [
            'name' => $request->route('name'),
            'token' => $request->route('token'),
        ];
    }

    private function panelRedirect(Request $request)
    {
        return redirect()->route('admin.panel', $this->adminRouteParams($request));
    }

    public function showAdminLoginForm(Request $request)
    {
        // ورود از آدرس ثابت
        if ($request->routeIs('admin.login.fixed')) {
            return Inertia::render('admin/Login', [
                'action' => route('admin.login.fixed.submit'),
            ]);
        }

        // ورود از آدرس قدیمی
        return Inertia::render('admin/Login', [
            'action' => route('admin.login', $this->adminRouteParams($request)),
        ]);
    }

    public function adminLogin(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'max:255'],
        ]);

        $admin = $request->attributes->get('url_admin');

        if (!$admin || !Auth::guard('admin')->attempt([
            'username' => $admin->username,
            'password' => $data['password'],
        ])) {
            return back()->withErrors([
                'username' => 'نام کاربری یا رمز عبور صحیح نیست!',
            ])->onlyInput('username');
        }

        $request->session()->regenerate();

        return redirect()->intended(
            route('admin.panel', $this->adminRouteParams($request))
        );
    }

    public function adminLoginByCredentials(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        if (!Auth::guard('admin')->attempt([
            'username' => $data['username'],
            'password' => $data['password'],
        ])) {
            return back()->withErrors([
                'username' => 'نام کاربری یا رمز عبور صحیح نیست!',
            ])->onlyInput('username');
        }

        $request->session()->regenerate();

        $admin = Auth::guard('admin')->user();

        return redirect()->to(
            url('/admin-' . $admin->url_name . '/' . $admin->login_token . '/panel')
        );
    }

    public function getData(Request $request)
    {
        $params = [
            'name' => $request->route('name'),
            'token' => $request->route('token'),
        ];

        return Inertia::render('admin/products', [
            'products' => Product::latest()->paginate(20),

            'productRoutes' => [
                'store' => route('admin.products.store', $params),
                'edit' => route('admin.products.edit', [
                    ...$params,
                    'product' => '__PRODUCT_ID__',
                ]),
                'delete' => route('admin.products.delete', [
                    ...$params,
                    'product' => '__PRODUCT_ID__',
                ]),
            ],

            'admins' => \App\Models\Admin::query()
                ->select([
                    'id',
                    'name',
                    'username',
                    'role',
                    'url_name',
                    'created_at',
                ])
                ->latest()
                ->get(),
        ]);
    }


    private function normalizeCategory(string $category): string
    {
        return match ($category) {
            'barberry' => 'zereshk',
            'rose' => 'gol-mohammadi',
            'zaferan' => 'saffron',
            default => $category,
        };
    }

    private function normalizeProductInput(Request $request): array
    {
        $category = $request->input('category', 'other');

        $packageType = $request->input('package_type');

        if ($packageType === null) {
            $packageType = $request->boolean('wholesale') ? 'عمده' : 'خرده';
        }

        $request->merge([
            'category' => $this->normalizeCategory((string) $category),
            'quality' => $request->input('quality', $request->input('grade')),
            'type' => $request->input('type', $request->input('variety', 'عمومی')),
            'sale_unit' => $request->input('sale_unit', $request->input('unit')),
            'package_type' => $packageType,
            'provider' => $request->input('provider', 'باغستان'),
            'is_special_offer' => $request->has('is_special_offer')
                ? $request->input('is_special_offer')
                : $request->boolean('special'),
            'discount_percent' => $request->input(
                'discount_percent',
                $request->input('discount', 0)
            ),
            'show_first_page' => $request->has('show_first_page')
                ? $request->input('show_first_page')
                : $request->boolean('featured'),
        ]);

        return $request->all();
    }

    private function createProductId(string $category, int $lastNumber): string
    {
        $prefix = config("products.categories.$category.prefix");

        if (!$prefix) {
            $prefix = match ($category) {
                'zereshk' => 'ZR',
                'gol-mohammadi' => 'GM',
                'saffron' => 'SF',
                default => 'OT',
            };
        }

        return $prefix . '-' . str_pad((string) $lastNumber, 3, '0', STR_PAD_LEFT);
    }

    private function createSlug(string $name): string
    {
        $base = Str::slug($name);

        if ($base === '') {
            $base = 'product-' . Str::lower(Str::random(8));
        }

        $slug = $base;
        $suffix = 2;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    /**
     * تصویر Data URL ارسال‌شده از فرم React را در storage/public ذخیره می‌کند.
     * اگر تصویری ارسال نشده باشد، null برمی‌گرداند.
     */
    private function storeDataUrlImage(?string $image): ?string
    {
        if (!$image || !str_starts_with($image, 'data:')) {
            \Log::warning('Product image is not a Data URL', [
                'image_type' => gettype($image),
                'image_value' => is_string($image) ? substr($image, 0, 100) : null,
            ]);

            return null;
        }

        \Log::info('Product image Data URL received', [
            'length' => strlen($image),
            'prefix' => substr($image, 0, 40),
        ]);


        if (!preg_match(
            '/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=\r\n]+)$/',
            $image,
            $matches
        )) {
            abort(422, 'فرمت تصویر معتبر نیست. فقط JPG، PNG و WebP مجاز هستند.');
        }

        $contents = base64_decode($matches[2], true);

        if ($contents === false || strlen($contents) > 2 * 1024 * 1024) {
            abort(422, 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد.');
        }

        $extension = match ($matches[1]) {
            'jpeg' => 'jpg',
            'png' => 'png',
            'webp' => 'webp',
        };

        $path = 'products/' . Str::uuid() . '.' . $extension;

        $saved = Storage::disk('public')->put($path, $contents);

        \Log::info('IMAGE STORAGE DEBUG', [
            'path' => $path,
            'saved' => $saved,
            'exists' => Storage::disk('public')->exists($path),
            'absolute_path' => Storage::disk('public')->path($path),
        ]);

        if (!$saved || !Storage::disk('public')->exists($path)) {
            throw new \RuntimeException('فایل تصویر در مسیر مورد انتظار ذخیره نشد.');
        }

        return $path;

        if (!$saved || !Storage::disk('public')->exists($path)) {
            throw new \RuntimeException('ذخیره‌سازی فایل تصویر انجام نشد.');
        }

        return $path;
    }

    public function storeProduct(Request $request)
    {
        $this->normalizeProductInput($request);

        $data = $request->validate([
            'category' => [
                'required',
                'string',
                Rule::in(['zereshk', 'gol-mohammadi', 'saffron', 'other']),
            ],
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:10000'],
            'price' => ['required', 'integer', 'min:0'],
            'quality' => ['required', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'max:50'],
            'sale_unit' => ['required', 'string', 'max:255'],
            'package_type' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'max:255'],
            'is_special_offer' => ['required', 'boolean'],
            'discount_percent' => ['nullable', 'integer', 'between:0,90'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:3000000'],
            'show_first_page' => ['required', 'boolean'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
        ]);

        $imagePath = null;

        try {
            $imagePath = $this->storeDataUrlImage($data['image'] ?? null);

            DB::transaction(function () use ($data, $imagePath) {
                $counterCategory = $data['category'] === 'saffron'
                    ? 'zaferan'
                    : $data['category'];

                $counter = ProductCounter::where('category', $counterCategory)
                    ->lockForUpdate()
                    ->firstOrFail();

                $counter->increment('last_number');

                Product::create([
                    'category' => $data['category'],
                    'name' => $data['name'],
                    'description' => $data['description'] ?? null,
                    'price' => $data['price'],
                    'code' => $this->createProductId(
                        $data['category'],
                        (int) $counter->last_number
                    ),
                    'quality' => $data['quality'],
                    'type' => $data['type'] ?? 'عمومی',
                    'sale_unit' => $data['sale_unit'],
                    'package_type' => $data['package_type'],
                    'provider' => $data['provider'],
                    'is_special_offer' => $data['is_special_offer'],
                    'discount_percent' => $data['discount_percent'] ?? 0,
                    'stock' => $data['stock'],
                    'min_order_quantity' => 1,
                    'image' => $imagePath,
                    'show_first_page' => $data['show_first_page'],
                    'slug' => $data['slug'] ?: $this->createSlug($data['name']),
                    'is_available' => (int) $data['stock'] > 0,
                ]);
            });
        } catch (\Throwable $e) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            throw $e;
        }

        return $this->panelRedirect($request)
            ->with('success', 'محصول با موفقیت ثبت شد.');
    }

    public function editProduct(
        Request $request,
        string $name,
        string $token,
        Product $product
    ) {
        $this->normalizeProductInput($request);

        $data = $request->validate([
            'category' => [
                'required',
                'string',
                Rule::in(['zereshk', 'gol-mohammadi', 'saffron', 'other']),
            ],
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:10000'],
            'price' => ['required', 'integer', 'min:0'],
            'quality' => ['required', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'max:50'],
            'sale_unit' => ['required', 'string', 'max:255'],
            'package_type' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'max:255'],
            'is_special_offer' => ['required', 'boolean'],
            'discount_percent' => ['nullable', 'integer', 'between:0,90'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:3000000'],
            'show_first_page' => ['required', 'boolean'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product->id),
            ],
        ]);
        $oldImagePath = $product->image;
        $newImagePath = $this->storeDataUrlImage($data['image'] ?? null);

        $update = [
            'category' => $data['category'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'quality' => $data['quality'],
            'type' => $data['type'] ?? 'عمومی',
            'sale_unit' => $data['sale_unit'],
            'package_type' => $data['package_type'],
            'provider' => $data['provider'],
            'is_special_offer' => $data['is_special_offer'],
            'discount_percent' => $data['discount_percent'] ?? 0,
            'stock' => $data['stock'],
            'show_first_page' => $data['show_first_page'],
            'is_available' => (int) $data['stock'] > 0,
        ];

        if (!empty($data['slug'])) {
            $update['slug'] = $data['slug'];
        }

        if ($newImagePath) {
            $update['image'] = $newImagePath;
        }

        try {
            $product->update($update);
        } catch (\Throwable $e) {
            if ($newImagePath) {
                Storage::disk('public')->delete($newImagePath);
            }

            throw $e;
        }

        if (
            $newImagePath &&
            $oldImagePath &&
            $oldImagePath !== $newImagePath
        ) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return $this->panelRedirect($request)
            ->with('success', 'محصول با موفقیت ویرایش شد.');
    }

    public function deleteProduct(
        Request $request,
        string $name,
        string $token,
        Product $product
    ) {
        $imagePath = $product->image;

        $product->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return $this->panelRedirect($request)
            ->with('success', 'محصول با موفقیت حذف شد.');
    }

    public function adminLogout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
