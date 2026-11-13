<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Product;

class ProductBackInStock extends Notification
{
    public function __construct(public Product $product) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'name'       => $this->product->name,
            'slug'       => $this->product->slug,
            'category'   => $this->product->category,
            'message'    => 'محصول «' . $this->product->name . '» موجود شد.',
        ];
    }
}
