<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Admin;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AdminPanelController extends Controller
{
    public function approveComment(
        Request $request,
        string $name,
        string $token,
        Comment $comment
    ) {
        abort_if($comment->parent_id !== null, 422, 'فقط نظر اصلی قابل تأیید است.');

        $admin = $request->user('admin');

        abort_if(!$admin, 403);

        $comment->status = 'approved';
        $comment->approved_at = now();
        $comment->approved_by = $admin->id;
        $comment->rejected_at = null;
        $comment->save();

        return back()->with('success', 'نظر تأیید شد.');
    }

    public function rejectComment(
        Request $request,
        string $name,
        string $token,
        Comment $comment
    ) {
        abort_if($comment->parent_id !== null, 422, 'فقط نظر اصلی قابل رد است.');

        $admin = $request->user('admin');

        abort_if(!$admin, 403);

        $comment->status = 'rejected';
        $comment->rejected_at = now();
        $comment->approved_at = null;
        $comment->approved_by = null;
        $comment->save();

        return back()->with('success', 'نظر رد شد.');
    }


    public function getSuperAdminData()
    {
        return inertia::render('admin/products', [
            'admins'   => Admin::select('id', 'name', 'role', 'username', 'url_name', 'created_at')->get(),
            'users'    => User::select('id', 'name', 'username', 'phone')->latest()->paginate(20, ['*'], 'users_page'),
            'orders' => Order::with('items')->latest('created_at')->paginate(20),
            'logs'      => Log::latest()->paginate(20, pageName: 'logs_page'),
            'products' => Product::latest()->paginate(20, pageName: 'products_page'),
            'comments' => Comment::where('status', 'pending')
                ->with(['author:id,name', 'product:id,name'])
                ->latest()->get()
                ->each->makeVisible('status'),
        ]);
    }

    public function getComments()
    {
        $comments = Comment::with([
            'author:id,name',
            'product:id,name',
        ])
            ->whereNull('parent_id')
            ->latest()
            ->get()
            ->map(fn($comment) => [
                'id' => (int) $comment->id,
                'userName' => $comment->author?->name ?? 'کاربر حذف‌شده',
                'productName' => $comment->product?->name ?? 'محصول حذف‌شده',
                'rating' => (int) ($comment->rating ?? 0),
                'body' => $comment->body,
                'date' => $comment->created_at?->toISOString(),
                'status' => $comment->status,
            ])
            ->values();

        return Inertia::render('admin/comments', [
            'comments' => $comments,
            'counts' => [
                'pending' => Comment::whereNull('parent_id')
                    ->where('status', 'pending')->count(),
                'approved' => Comment::whereNull('parent_id')
                    ->where('status', 'approved')->count(),
                'rejected' => Comment::whereNull('parent_id')
                    ->where('status', 'rejected')->count(),
            ],
        ]);
    }


    public function newAdmin(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'role'     => ['required', 'in:admin,super'],
            'username' => ['required', 'string', 'max:255', 'unique:admins,username'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
            'url_name' => ['required', 'alpha_dash', 'max:100', 'unique:admins,url_name'],
        ]);

        $admin = Admin::create($data + ['login_token' => Str::random(48)]);

        return back()->with([
            'success'   => 'ادمین با موفقیت اضافه شد!',
            'login_url' => route('admin.login.form', ['name' => $admin->url_name, 'token' => $admin->login_token]),
        ]);
    }

    public function editAdmin(Request $request, Admin $admin)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'role'     => ['required', 'in:admin,super'],
            'username' => ['required', 'string', 'max:255', Rule::unique('admins', 'username')->ignore($admin->id)],
            'url_name' => ['required', 'alpha_dash', 'max:100', Rule::unique('admins', 'url_name')->ignore($admin->id)],
            'password' => ['nullable', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        if (
            $admin->role === 'super' && $data['role'] !== 'super'
            && Admin::where('role', 'super')->count() <= 1
        ) {
            return back()->withErrors(['role' => 'نمی‌توان آخرین سوپر ادمین را تنزل داد.']);
        }

        if (blank($data['password'])) {
            unset($data['password']);
        }

        $admin->update($data);

        return back()->with('success', 'ادمین با موفقیت ویرایش شد!');
    }

    public function deleteAdmin(Request $request, Admin $admin)
    {
        abort_if($admin->id === $request->user('admin')->id, 403, 'نمی‌توانید خودتان را حذف کنید.');

        if ($admin->role === 'super' && Admin::where('role', 'super')->count() <= 1) {
            return back()->with('error', 'نمی‌توان آخرین سوپر ادمین را حذف کرد.');
        }

        $admin->delete();

        return back()->with('success', 'ادمین با موفقیت حذف شد.');
    }
}
