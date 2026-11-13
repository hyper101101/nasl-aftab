<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ProductCounter', function (Blueprint $table) {
            $table->id();
            $table->string('category')->comment('دسته بندی')->unique();
            $table->unsignedInteger('last_number')->default('0')->comment('آخرین مقدار');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product-counters');
    }
};
