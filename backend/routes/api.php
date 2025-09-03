<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TableController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Public
Route::get('/tables', [TableController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('foods', FoodController::class)->middleware('role:waiter');
    Route::get('/orders', [OrderController::class,'index'])->middleware('role:waiter,cashier');
    Route::post('/orders/open', [OrderController::class,'open'])->middleware('role:waiter');
    Route::get('/orders/{order}', [OrderController::class,'show'])->middleware('role:waiter,cashier');
    Route::post('/orders/{order}/items', [OrderController::class,'addItem'])->middleware('role:waiter');
    Route::post('/orders/{order}/close', [OrderController::class,'close'])->middleware('role:waiter,cashier');
    Route::get('/orders/{order}/receipt', [OrderController::class,'receipt'])->middleware('role:cashier');
});

