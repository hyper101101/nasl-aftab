<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use Illuminate\Support\Facades\Gate;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use App\Models\Admin;
use Illuminate\Database\UniqueConstraintViolationException;
use App\Models\CommentReaction;

class CommentController extends Controller
{
    public function newComment(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Admin) {
            return back()->with(
                'error',
                'فقط خریداران محصول امکان ثبت نظر دارند، نه مدیر!'
            );
        }

        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:5', 'max:500'],
        ]);
        try {
            $isPurchased = OrderItem::where('product_id', $data['product_id'])
                ->whereHas('order', fn($q) => $q->where('user_id', $user->id)->where('status', 'paid'))
                ->exists();
            if (! $isPurchased) {
                return back()->withErrors([
                    'comment' => 'برای ثبت نظر، ابتدا باید این محصول را خریداری کرده باشید.',
                ]);
            }
            $result = DB::transaction(function () use ($data, $user) {
                $exists = Comment::whereNull('parent_id')
                    ->where('product_id', $data['product_id'])
                    ->whereMorphedTo('author', $user)
                    ->lockForUpdate()
                    ->exists();
                if ($exists) {
                    return False;
                }
                $comment = new Comment($data);
                $comment->author()->associate($user);
                $comment->status = 'pending';
                $comment->root_key = $comment->product_id;
                $comment->save();
                return True;
            });
        } catch (UniqueConstraintViolationException $e) {
            $result = false;
        }


        if (! $result) {
            return back()->with('error', 'تنها یکبار میتوانید برای محصول نظر بگذارید!');
        }

        return back()->with('success', 'نظر شما با موفقیت ثبت شد! پس از تایید ادمین سایت نمایش داده میشود.');
    }

    public function replyComment(Request $request)
    {
        $data = $request->validate([
            'parent_id' => ['required', 'integer', 'exists:comments,id'],
            'body' => ['required', 'string', 'min:5', 'max:500'],
        ]);
        $author = $request->user();
        $isAdmin = $author instanceof Admin;
        $parent = Comment::approved()
            ->findOrFail($data['parent_id']);
        $comment = new Comment([
            'product_id' => $parent->product_id,
            'parent_id' => $parent->id,
            'body' => $data['body'],
        ]);
        $comment->author()->associate($author);
        $comment->status = $isAdmin ? 'approved' : 'pending';
        $comment->approved_at = $isAdmin ? now() : null;
        $comment->save();

        return back()->with(
            'success',
            $isAdmin ?
                'پاسخ شما ثبت شد' :
                'پاسخ شما ثبت شد و پس از تایید نمایش داده میشود'
        );
    }

    public function updateReply(Request $request, Comment $comment)
    {
        abort_if(is_null($comment->parent_id), 404);
        Gate::authorize('update', $comment);

        $data = $request->validate([
            'body' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $isAdmin = $request->user() instanceof Admin;

        $comment->before_edit ??= $comment->body;
        $comment->status = $isAdmin ? 'approved' : 'pending';
        $comment->body = $data['body'];
        $comment->edited_at = now();
        $comment->save();

        return back()->with(
            'success',
            $isAdmin
                ? 'پاسخ شما با موفقیت ویرایش شد!'
                : 'پاسخ شما ویرایش شد و پس از تأیید نمایش داده می‌شود.'
        );
    }

    public function updateComment(Request $request, Comment $comment)
    {
        abort_if(! is_null($comment->parent_id), 404);
        //        Gate::authorize('update', $comment);
        Gate::forUser($request->user())->authorize('update', $comment);
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $comment->before_edit ??= $comment->body;
        $comment->fill($data);
        $comment->status = 'pending';
        $comment->edited_at = now();
        $comment->save();

        return back()->with('success', 'نظر شما با موفقیت ویرایش شد! پس از تایید مدیر سایت در دید عموم قرار میگیرد.');
    }

    public function deleteComment(Request $request, Comment $comment)
    {
        //        Gate::authorize('delete', $comment);
        Gate::forUser($request->user())->authorize('delete', $comment);
        $comment->delete();

        return back()->with('success', 'نظر شما حذف شد!');
    }

    public function thumbs(Request $request, Comment $comment)
    {
        abort_if($request->user() instanceof Admin, 403);
        abort_unless($comment->status === 'approved', 404);
        $data = $request->validate([
            'is_like' => ['required', 'boolean'],
        ]);

        abort_unless($comment->status === 'approved', 404);

        $user = $request->user();

        $reaction = CommentReaction::where('comment_id', $comment->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $reaction) {
            CommentReaction::create([
                'comment_id' => $comment->id,
                'user_id'    => $user->id,
                'is_like'    => $data['is_like'],
            ]);
        } elseif ($reaction->is_like === (bool) $data['is_like']) {
            $reaction->delete();
        } else {
            $reaction->update(['is_like' => $data['is_like']]);
        }

        return back();
    }
}
