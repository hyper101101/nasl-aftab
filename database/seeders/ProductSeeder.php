<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::insert([
            [
                'category' => 'zereshk',
                'name' => 'زرشک درجه 1',
                'price' => 10000,
                'code' => 'ZR-001',
                'quality' => 'درجه 1',
                'type' => 'پفکی',
                'sell_unit' => 'عمده',
                'package_type' => 'جعبه ای',
                'provider' => 'از نسل آفتاب',
                'is_special_offer' => False,
                'discount_percent' => 0,
                'stock' => 100,
                'image' => Null,
                'show_first_page' => True,
                'slug' => 'zereshk-daraje-1',
            ]
        ]);
    }
}
