<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assistance_requests', function (Blueprint $table) {
            $table->id('request_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('assigned_ictu_id')->nullable();
            
            $table->enum('request_type', ['technical', 'repair']);
            $table->string('subject', 150)->nullable();
            $table->text('description')->nullable();
            $table->date('preferred_date')->nullable();
            $table->time('preferred_time')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();
            $table->integer('estimated_duration')->nullable();
            
            $table->enum('status', ['pending', 'approved', 'reassigned', 'rejected', 'in_progress', 'awaiting_csf', 'completed'])->default('pending');
            
            $table->text('rejection_reason')->nullable();
            $table->text('reassignment_reason')->nullable();
            $table->text('ictu_remarks')->nullable();
            
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Foreign Keys
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('assigned_ictu_id')->references('user_id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assistance_requests');
    }
};