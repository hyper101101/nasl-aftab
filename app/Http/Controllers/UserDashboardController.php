<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('User/Dashboard', [
            'name' => $user->name,
            'username' => $user->username,
            'phone' => $user->phone,
            'sign_up_at' => $user->sign_up_at,
            'orders' => Order::where('user_id', $user->id)
        ]);
    }

    public function changePassword(Request $request)
    {
        //after sms code and approve it
        $user = Auth::user();
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->password = $data['password'];
        $user->save();
        return redirect('user/dashboard');
    }

    public function changePhone(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'phone_number' => [
                'required',
                'string',
                'regex:/^09\d{9}$/',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
        ]);

        $user->phone = $data['phone_number'];
        $user->save();

        return redirect('user/dashboard');
    }

    public function changeUsername(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'username' => [
                'required',
                'string',
                'min:8',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
        ]);
        $user->username = $data['username'];
        $user->save();

        return redirect('user/dashboard');
    }

    public function orderDetails(Order $order)
    {
        if ($order->user_id != Auth::id()) {
            abort(403);
        }
        $orderDetails = OrderItem::where('order_id', $order->id)->get();
        return Inertia::render('User/Order/Details', [
            'order' => $order,
            'orderItems' => $orderDetails,
        ]);
    }

    public function comments()
    {
        $comments = Comment::where('author_id', Auth::id())
            ->where('author_type', 'user')
            ->get();

        return Inertia::render('User/Dashboard/Comments', [
            'comments' => $comments,
        ]);
    }

    public function chatList()
    {
        $chats = Conversation::where('user_id', Auth::id())
            ->latest()
            ->paginate(10);
        return Inertia::render('User/Chat/List', [
            'chats' => $chats,
        ]);
    }

    public function chat(Conversation $conversation)
    {
        abort_unless(
            $conversation->user_id === Auth::id(),
            403
        );

        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('User/Chat/Show', [
            'messages' => $messages,
            'product' => $conversation->product_id,
            'chat_status' => $conversation->status,
        ]);
    }
}
