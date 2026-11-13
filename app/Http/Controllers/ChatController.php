<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    // فهرست گفت‌وگوهای پنل مدیریت
    public function chatList(Request $request): Response
    {
        $admin = $request->user('admin');

        abort_unless($admin instanceof Admin, 403);

        $query = Conversation::query()
            ->with([
                'user:id,name',
                'product:id,name,slug,image',
                'admin:id,name',
            ])
            ->withCount('messages')
            ->latest('last_message_at')
            ->latest('updated_at');

        if ($admin->role === 'common') {
            $query->where(function ($q) use ($admin) {
                $q->where('status', 'pending')
                    ->orWhere(function ($assigned) use ($admin) {
                        $assigned->where('status', 'open')
                            ->where('assigned_admin_id', $admin->getKey());
                    });
            });
        }

        return Inertia::render('admin/Chat/List', [
            'chats' => $query->get(),
        ]);
    }

    // مشاهده گفت‌وگو توسط ادمین

    public function chat(Request $request, Conversation $chat): Response
    {
        Gate::authorize('view', $chat);

        $this->markUserMessagesAsRead($chat);

        $messages = $chat->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        return Inertia::render('admin/Chat', [
            'chat' => $chat->load([
                'user:id,name,phone',
                'product:id,name,slug,image',
                'admin:id,name',
            ]),
            'messages' => $messages,
        ]);
    }


    // ایجاد یا بازیابی گفت‌وگوی کاربر برای یک محصول
    public function newChat(Request $request, Product $product)
    {
        $user = $request->user('web');

        abort_unless($user instanceof User, 401);

        if ((int) $product->stock < 1 || ! $product->is_available) {
            return back()->with(
                'error',
                'امکان گفت‌وگو درباره این محصول وجود ندارد؛ محصول ناموجود است.'
            );
        }

        $conversation = DB::transaction(function () use ($user, $product) {
            $existing = Conversation::query()
                ->where('user_id', $user->getKey())
                ->where('product_id', $product->getKey())
                ->whereIn('status', ['pending', 'open'])
                ->lockForUpdate()
                ->latest('updated_at')
                ->first();

            if ($existing) {
                return $existing;
            }

            return Conversation::create([
                'user_id' => $user->getKey(),
                'product_id' => $product->getKey(),
                'status' => 'pending',
                'last_message_at' => null,
            ]);
        });

        // به صفحه محصول برمی‌گردیم؛ صفحه محصول باید گفت‌وگو را از دیتابیس بخواند.
        return back()->with('success', 'گفت‌وگوی شما آماده است.');
    }

    // پذیرش گفت‌وگو توسط ادمین
    public function receptionChat(Request $request, Conversation $chat)
    {
        Gate::authorize('accept', $chat);

        $admin = $request->user('admin');

        abort_unless($admin instanceof Admin, 403);

        $updated = Conversation::query()
            ->whereKey($chat->getKey())
            ->where('status', 'pending')
            ->whereNull('assigned_admin_id')
            ->update([
                'status' => 'open',
                'assigned_admin_id' => $admin->getKey(),
                'updated_at' => now(),
            ]);

        if ($updated !== 1) {
            return back()->with(
                'error',
                'این گفت‌وگو قبلاً توسط ادمین دیگری پذیرفته شده است.'
            );
        }

        return to_route('chat.chat', ['chat' => $chat->getKey()])
            ->with('success', 'گفت‌وگو با موفقیت به شما واگذار شد.');
    }

    // بستن گفت‌وگو
    public function closeChat(Request $request, Conversation $chat)
    {
        Gate::authorize('close', $chat);

        $chat->update([
            'status' => 'close',
        ]);

        return back()->with('success', 'گفت‌وگو با موفقیت بسته شد.');
    }

    // ارسال پیام توسط مشتری
    public function storeMessage(
        Request $request,
        Product $product,
        Conversation $chat
    ) {
        $this->ensureProductMatchesConversation($product, $chat);

        Gate::authorize('sendMessage', $chat);

        $user = $request->user('web');

        abort_unless($user instanceof User, 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($chat, $user, $data) {
            $message = $chat->messages()->make([
                'body' => trim($data['body']),
            ]);

            $message->sender()->associate($user);
            $message->save();

            $chat->forceFill([
                'last_message_at' => $message->created_at ?? now(),
            ])->save();
        });

        return back()->with('success', 'پیام ارسال شد.');
    }

    // ارسال پیام توسط ادمین
    public function storeAdminMessage(Request $request, Conversation $chat)
    {
        Gate::authorize('sendAdminMessage', $chat);

        $admin = $request->user('admin');

        abort_unless($admin instanceof Admin, 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($chat, $admin, $data) {
            $message = $chat->messages()->make([
                'body' => trim($data['body']),
            ]);

            $message->sender()->associate($admin);
            $message->save();

            $chat->forceFill([
                'last_message_at' => $message->created_at ?? now(),
            ])->save();
        });

        return back()->with('success', 'پیام ارسال شد.');
    }

    // ویرایش پیام توسط مشتری
    public function editMessage(
        Request $request,
        Product $product,
        Conversation $chat
    ) {
        $this->ensureProductMatchesConversation($product, $chat);

        $data = $request->validate([
            'message_id' => ['required', 'integer'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = $chat->messages()->findOrFail($data['message_id']);

        Gate::authorize('editMessage', [$chat, $message]);

        $message->update([
            'body' => trim($data['body']),
        ]);

        return back()->with('success', 'پیام ویرایش شد.');
    }

    // ویرایش پیام توسط ادمین
    public function editAdminMessage(Request $request, Conversation $chat)
    {
        $data = $request->validate([
            'message_id' => ['required', 'integer'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = $chat->messages()->findOrFail($data['message_id']);

        Gate::authorize('editMessage', [$chat, $message]);

        $message->update([
            'body' => trim($data['body']),
        ]);

        return back()->with('success', 'پیام ویرایش شد.');
    }

    // حذف پیام توسط مشتری
    public function deleteMessage(
        Request $request,
        Product $product,
        Conversation $chat
    ) {
        $this->ensureProductMatchesConversation($product, $chat);

        $data = $request->validate([
            'message_id' => ['required', 'integer'],
        ]);

        $message = $chat->messages()->findOrFail($data['message_id']);

        Gate::authorize('deleteMessage', [$chat, $message]);

        $message->delete();

        return back()->with('success', 'پیام حذف شد.');
    }

    // حذف پیام توسط ادمین
    public function deleteAdminMessage(Request $request, Conversation $chat)
    {
        $data = $request->validate([
            'message_id' => ['required', 'integer'],
        ]);

        $message = $chat->messages()->findOrFail($data['message_id']);

        Gate::authorize('deleteMessage', [$chat, $message]);

        $message->delete();

        return back()->with('success', 'پیام حذف شد.');
    }


    // دریافت پیام‌ها و وضعیت گفتگو برای پنل ادمین
    public function adminMessages(Request $request, Conversation $chat)
    {
        $admin = $request->user('admin');

        abort_unless($admin instanceof Admin, 403);

        Gate::authorize('view', $chat);

        $messages = $chat->messages()
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $this->markUserMessagesAsRead($chat);

        return response()->json([
            'chat' => [
                'id' => $chat->id,
                'status' => $chat->status,
            ],
            'messages' => $messages,
        ]);
    }

    // دریافت پیام‌ها و وضعیت گفتگو برای مشتری
    public function customerMessages(
        Request $request,
        Product $product,
        Conversation $chat
    ) {
        $user = $request->user('web');

        abort_unless($user instanceof User, 401);

        $this->ensureProductMatchesConversation($product, $chat);

        Gate::authorize('view', $chat);

        $messages = $chat->messages()
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        return response()->json([
            'conversation' => [
                'id' => $chat->id,
                'status' => $chat->status,
                'product_id' => $chat->product_id,
            ],
            'messages' => $messages,
        ]);
    }


    // اطمینان از تعلق گفت‌وگو به محصول موجود در آدرس
    private function ensureProductMatchesConversation(
        Product $product,
        Conversation $chat
    ): void {
        abort_unless(
            (int) $chat->product_id === (int) $product->getKey(),
            404
        );
    }

    // علامت‌گذاری پیام‌های مشتری به‌عنوان خوانده‌شده هنگام مشاهده توسط ادمین
    private function markUserMessagesAsRead(Conversation $chat): void
    {
        $userMorphType = (new User())->getMorphClass();

        $chat->messages()
            ->where('sender_type', $userMorphType)
            ->where('sender_id', $chat->user_id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);
    }
}
