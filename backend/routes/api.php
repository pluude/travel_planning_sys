<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DestinationController;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Destinations
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{id}', [DestinationController::class, 'show']);

// Questionnaire / recommendations
Route::post('/recommendations', [DestinationController::class, 'recommend']);