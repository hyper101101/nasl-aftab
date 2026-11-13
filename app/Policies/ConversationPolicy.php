<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

class ConversationPolicy
{
    private function isOwner(
        User $user,
        Conversation $conversation
    ): bool {
        return (int) $conversation->user_id === (int) $user->getKey();
    }

    private function canAdminManage(
        Admin $admin,
        Conversation $conversation
    ): bool {
        return $admin->role !== 'common'
            || (int) $conversation->assigned_admin_id === (int) $admin->getKey();
    }

    public function viewAny(Admin $admin): bool
    {
        return true;
    }

    public function view(
        Admin|User $actor,
        Conversation $conversation
    ): bool {
        if ($actor instanceof Admin) {
            return $actor->role !== 'common'
                || $conversation->status !== 'close';
        }

        return $this->isOwner($actor, $conversation);
    }

    public function accept(
        Admin $admin,
        Conversation $conversation
    ): bool {
        return $conversation->status === 'pending'
            && $conversation->assigned_admin_id === null;
    }

    public function sendMessage(
        User $user,
        Conversation $conversation
    ): bool {
        return $this->isOwner($user, $conversation)
            && in_array($conversation->status, ['pending', 'open'], true);
    }

    public function sendAdminMessage(
        Admin $admin,
        Conversation $conversation
    ): bool {
        return $conversation->status === 'open'
            && $this->canAdminManage($admin, $conversation);
    }

    public function editMessage(
        Admin|User $actor,
        Conversation $conversation,
        Message $message
    ): bool {
        if ((int) $message->conversation_id !== (int) $conversation->id) {
            return false;
        }

        if ($conversation->status === 'close') {
            return false;
        }

        if ($actor instanceof Admin) {
            return $this->canAdminManage($actor, $conversation)
                && $message->sender_type === $actor->getMorphClass()
                && (int) $message->sender_id === (int) $actor->getKey();
        }

        return $this->isOwner($actor, $conversation)
            && $message->sender_type === $actor->getMorphClass()
            && (int) $message->sender_id === (int) $actor->getKey();
    }

    public function deleteMessage(
        Admin|User $actor,
        Conversation $conversation,
        Message $message
    ): bool {
        return $this->editMessage($actor, $conversation, $message);
    }

    public function close(
        Admin $admin,
        Conversation $conversation
    ): bool {
        return $conversation->status === 'open'
            && $this->canAdminManage($admin, $conversation);
    }
}
