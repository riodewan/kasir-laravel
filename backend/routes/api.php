<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TableController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Public
Route::get('/tables', [TableController::class, 'index']);

// Auth via Breeze API (Sanctum)
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    // Logout: waiter & cashier
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->middleware('role:waiter,cashier');

    // Foods CRUD: waiter only (ubah ke waiter,cashier jika mau dua-duanya)
    Route::apiResource('foods', FoodController::class)
        ->middleware('role:waiter');

    // Orders list: waiter & cashier
    Route::get('/orders', [OrderController::class, 'index'])
        ->middleware('role:waiter,cashier');

    // Open order: waiter only (sesuai user story)
    Route::post('/orders/open', [OrderController::class, 'open'])
        ->middleware('role:waiter');

    // Order detail: waiter & cashier
    Route::get('/orders/{order}', [OrderController::class, 'show'])
        ->middleware('role:waiter,cashier');

    // Add item to order: waiter only
    Route::post('/orders/{order}/items', [OrderController::class, 'addItem'])
        ->middleware('role:waiter');

    // Close order: waiter & cashier (keduanya boleh menutup)
    Route::post('/orders/{order}/close', [OrderController::class, 'close'])
        ->middleware('role:waiter,cashier');

    // Receipt PDF: cashier only (umumnya kasir yang cetak struk)
    Route::get('/orders/{order}/receipt', [OrderController::class, 'receipt'])
        ->middleware('role:cashier');
});
