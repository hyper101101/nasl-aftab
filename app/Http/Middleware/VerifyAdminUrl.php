<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Admin;
use Illuminate\Support\Facades\URL;

class VerifyAdminUrl
{
    public function handle(Request $request, Closure $next)
    {
        $admin = Admin::where('url_name', $request->route('name'))->first();

        if (! $admin || ! hash_equals($admin->login_token, (string) $request->route('token'))) {
            abort(404);
        }

        $current = $request->user('admin');
        if ($current && $current->id !== $admin->id) {
            abort(403);
        }

        URL::defaults(['name' => $admin->url_name, 'token' => $admin->login_token]);
        $request->attributes->set('url_admin', $admin);

        return $next($request);
    }
}
