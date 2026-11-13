<?php

namespace Database\Seeders;

use App\Models\ProductCounter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductCounterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProductCounter::insert([
            [
                'category' => 'zereshk',
                'last_number' => 0,
            ],
            [
                'category' => 'gol-mohammadi',
                'last_number' => 0,
            ],
            [
                'category' => 'zaferan',
                'last_number' => 0,
            ],
            [
                'category' => 'other',
                'last_number' => 0,
            ]
        ]);
    }
}
