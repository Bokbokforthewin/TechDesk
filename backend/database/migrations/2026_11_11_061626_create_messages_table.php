<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id('message_id');
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->text('message_content');
            $table->timestamp('sent_at')->useCurrent();
            $table->boolean('is_read')->default(false);

            // Foreign Keys
            $table->foreign('request_id')->references('request_id')->on('assistance_requests')->onDelete('cascade');
            $table->foreign('sender_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};