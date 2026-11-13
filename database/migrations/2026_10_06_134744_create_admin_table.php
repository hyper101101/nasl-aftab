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
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('نام ادمین');
            $table->string('role')->default('common')->comment('نقش ادمین');
            $table->string('username')->unique()->comment('نام کاربری ادمین');
            $table->string('password')->comment('رمز عبور');
            $table->string('url_name')->unique()->comment('نام لینک');
            $table->string('login_token', 64)->unique()->comment('توکن ورود');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin');
    }
};
