<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AssistanceRequestController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\DashboardController;

// Public Auth Route
Route::post('/login', [AuthController::class, 'login']);

// Protected System Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Live Operational Dashboard
    Route::get('/dashboard/live', [DashboardController::class, 'index']);

    // Assistance Requests & Personnel Management
    Route::get('/ictu-personnel', [AssistanceRequestController::class, 'getIctuPersonnel']);
    Route::get('/requests', [AssistanceRequestController::class, 'index']);
    Route::post('/requests', [AssistanceRequestController::class, 'store']);
    Route::get('/requests/{id}', [AssistanceRequestController::class, 'show']);
    
    // Workflow Action Transitions: Approve (In Progress), Reassign, Reject, Finish (Awaiting CSF), and Submit CSF (Completed)
    Route::post('/requests/{id}/approve', [AssistanceRequestController::class, 'approve']);
    Route::post('/requests/{id}/reassign', [AssistanceRequestController::class, 'reassign']);
    Route::post('/requests/{id}/reject', [AssistanceRequestController::class, 'reject']);
    Route::post('/requests/{id}/status', [AssistanceRequestController::class, 'updateStatus']);
    Route::post('/requests/{id}/csf', [AssistanceRequestController::class, 'submitCsf']);

    // Request Chat Messages
    Route::get('/requests/{id}/messages', [AssistanceRequestController::class, 'getMessages']);
    Route::post('/requests/{id}/messages', [AssistanceRequestController::class, 'sendMessage']);

    // Admin Subject Dropdown Options
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);
});