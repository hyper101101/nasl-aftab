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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('category')->comment('دسته بندی');
            $table->string('name', length: 50)->comment('نام');
            $table->unsignedInteger('price')->default('0')->comment('قیمت محصول');
            $table->string('code', length: 15)->unique()->comment('کد کالا');
            $table->string('quality', length: 50)->comment('کیفیت محصول');
            $table->string('type', length: 50)->comment('نوع محصول');
            $table->string('sale_unit')->comment('واحد فروش');
            $table->string('package_type')->comment('نوع بسته بندی');
            $table->string('provider')->comment('عرضه کننده');
            $table->boolean('is_special_offer')->comment('پیشنهاد ویژه');
            $table->unsignedInteger('discount_percent')->nullable()->comment('درصد تخفیف');
            $table->unsignedInteger('stock')->default('0')->comment('موجودی');
            $table->unsignedInteger('min_order_quantity')->comment('حداقل مقدار قابل سفارش');
            $table->string('image')->nullable()->comment('تصویر کالا');
            $table->boolean('show_first_page')->comment('نمایش در صفحه اصلی');
            $table->string('slug')->unique()->comment('شناسه آدرس');
            $table->boolean('is_available')->default(1)->comment('وضعیت فروش');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
