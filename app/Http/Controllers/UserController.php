<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Cart;
use Inertia\Inertia;


class UserController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('login');
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string|digits:11',
            'password' => 'required|string'
        ]);
        if (! Auth::attempt(['phone' => $data['phone'], 'password' => $data['password']])) {
            return back()->withErrors([
                'phone' => 'شماره تلفن یا رمز عبور صحیح نیست!'
            ])->onlyInput('phone');
        }
        //اینجا بعد لاگین کاربر با کد زیر اطلاعاتش رو میتونی نمایش بدی
        //import { usePage } from '@inertiajs/react';
        //
        //export default function Dashboard() {
        //    const { auth } = usePage().props;
        //
        //    return (
        //        <div>
        //            <h1>سلام {auth.user.name}</h1>
        //            <p>شماره تلفن: {auth.user.phone}</p>
        //        </div>
        //    );
        //}
        $user = User::where('phone', $data['phone'])->first();
        Cart::mergeGuestIntoUser($user->id);
        $request->session()->regenerate();
        //یه داشبورد برای کاربر ها بساز
        return redirect()->intended('/');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login.page');
    }

    public function showRegisterForm()
    {
        return Inertia::render('register');
    }

    public function register(Request $request)
    {
        //جلوی کاربر ثبت نام شده به رفتن به این روت باید گرفته شه
        $request->merge([
            'phone' => strtr($request->phone, ['۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9']),
        ]);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'string|unique:users,username|max:255',
            'phone' => 'required|string|regex:/^09\d{9}$/|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $data['sign_up_at'] = date('Y-m-d');
        $user = User::create($data);
        if ($user) {
            Auth::login($user);
            $request->session()->regenerate();
            Cart::mergeGuestIntoUser($user->id);
            return redirect()->intended('/products');
        }
        return back()->withErrors([
            'phone' => 'متاسفانه مشکلی در ثبت نام پیش آمده! لطفا مجددا تلاش کنید.'
        ])->onlyInput('phone');
    }
}
