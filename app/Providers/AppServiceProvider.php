<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Gate;
use App\Models\Conversation;
use App\Policies\ConversationPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'user'  => User::class,
            'admin' => Admin::class,
        ]);
        Gate::policy(Conversation::class, ConversationPolicy::class);
    }
}
