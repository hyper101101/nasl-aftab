<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Auth\Access\Response;

class CommentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Comment $comment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */

    private function isOwner(User|Admin $user, Comment $comment): bool
    {
        return $comment->author_type === $user->getMorphClass()
            && (int) $comment->author_id === (int) $user->getKey();
    }
    public function update(User $user, Comment $comment): bool
    {
        return $this->isOwner($user, $comment)
            && $comment->status !== 'rejected';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Comment $comment): bool
    {
         return $user instanceof Admin || $this->isOwner($user, $comment);
    }

    public function isThumbs(Comment $comment): bool
    {

    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Comment $comment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Comment $comment): bool
    {
        return false;
    }
}
