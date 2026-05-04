<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\TripPlanController;
use App\Http\Controllers\TripDayController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\FeedbackController;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Destinations
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{id}', [DestinationController::class, 'show']);
Route::get('/destinations/{id}/attractions', [DestinationController::class, 'attractions']);

// Questionnaire / recommendations
Route::post('/recommendations', [DestinationController::class, 'recommend']);

// Feedback (public read)
Route::get('/feedback', [FeedbackController::class, 'index']);

// Trip Plans
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/trip-plans', [TripPlanController::class, 'index']);
    Route::get('/trip-plans/compare', [TripPlanController::class, 'compare']);
    Route::post('/trip-plans', [TripPlanController::class, 'store']);
    Route::get('/trip-plans/{id}', [TripPlanController::class, 'show']);
    Route::patch('/trip-plans/{id}', [TripPlanController::class, 'update']);
    Route::delete('/trip-plans/{id}', [TripPlanController::class, 'destroy']);

    // Trip Days
    Route::get('/trip-days/{id}', [TripDayController::class, 'show']);

    // Activities
    Route::post('/trip-days/{tripDayId}/activities', [ActivityController::class, 'store']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);

    // Feedback (authenticated write/delete)
    Route::post('/feedback', [FeedbackController::class, 'store']);
    Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);
});

// Admin-only content management
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/destinations', [DestinationController::class, 'store']);
    Route::patch('/destinations/{id}', [DestinationController::class, 'update']);
    Route::delete('/destinations/{id}', [DestinationController::class, 'destroy']);

    Route::post('/destinations/{id}/attractions', [DestinationController::class, 'storeAttraction']);
    Route::patch('/attractions/{id}', [DestinationController::class, 'updateAttraction']);
    Route::delete('/attractions/{id}', [DestinationController::class, 'destroyAttraction']);
});