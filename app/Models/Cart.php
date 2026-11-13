<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'guest_token',
    ];

    public function items() : HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public static function current(): self
    {
        if ($userId = Auth::id()) {
            return static::firstOrCreate(['user_id' => $userId]);
        }
        $token = session('guest_cart_token');
        if (! $token) {
            $token = Str::random(40);
            session(['guest_cart_token' => $token]);
        }

        return static::firstOrCreate(['guest_token' => $token]);
    }

    public static function mergeGuestIntoUser(int $userId): void
    {
        $token = session('guest_cart_token');

        if (! $token) {
            return;
        }

        $guestCart = static::where('guest_token', $token)->first();

        if (! $guestCart) {
            return;
        }

        DB::transaction(function () use ($guestCart, $userId) {
            $userCart = static::firstOrCreate(['user_id' => $userId]);

            foreach ($guestCart->items as $item) {
                $existing = $userCart->items()->where('product_id', $item->product_id)->first();

                if ($existing) {
                    $existing->increment('quantity', $item->quantity);
                } else {
                    $item->update(['cart_id' => $userCart->id]);
                }
            }

            $guestCart->delete();
        });

        session()->forget('guest_cart_token');
    }

    protected $hidden = [
        'user_id',
        'guest_token',
    ];
}
