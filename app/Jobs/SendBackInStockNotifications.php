<?php

namespace App\Jobs;

use App\Models\StockSubscription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Product;
use App\Notifications\ProductBackInStock;

class SendBackInStockNotifications implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $productId) {}

    public function handle(): void
    {
        $product = Product::find($this->productId);

        if (! $product || $product->stock <= 0) {
            return;
        }

        StockSubscription::where('product_id', $product->id)
            ->whereNull('notified_at')
            ->with('user')
            ->chunkById(200, function ($subs) use ($product) {
                foreach ($subs as $sub) {
                    $sub->user->notify(new ProductBackInStock($product));
                    $sub->update(['notified_at' => now()]);
                }
            });
    }
}
