<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assistance_completion_forms', function (Blueprint $table) {
            $table->id('form_id');
            $table->unsignedBigInteger('request_id')->unique(); // 1-to-1 relationship enforced by UNIQUE
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('form_data')->nullable();
            $table->timestamp('submitted_at')->nullable();

            // Foreign Keys
            $table->foreign('request_id')->references('request_id')->on('assistance_requests')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assistance_completion_forms');
    }
};