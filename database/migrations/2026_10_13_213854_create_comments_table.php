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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->morphs('author');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('body');
            $table->string('status', 20)->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->text('before_edit')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unsignedBigInteger('root_key')->nullable();
            $table->unique(['author_type', 'author_id', 'root_key']);
            $table->index(['product_id', 'status', 'parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
