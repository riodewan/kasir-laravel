<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\FoodStoreRequest;
use App\Http\Requests\FoodUpdateRequest;

class FoodController extends Controller
{
    /**
     * GET /api/foods
     */
    public function index(): JsonResponse
    {
        $foods = Food::query()
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Foods fetched successfully.',
            'data'    => $foods,
        ]);
    }

    /**
     * POST /api/foods
     */
    public function store(FoodStoreRequest $request): JsonResponse
    {
        $food = Food::create($request->validated());

        return response()->json([
            'message' => 'Food created successfully.',
            'data'    => $food,
        ], 201);
    }

    /**
     * GET /api/foods/{food}
     */
    public function show(Food $food): JsonResponse
    {
        return response()->json([
            'message' => 'Food fetched successfully.',
            'data'    => $food,
        ]);
    }

    /**
     * PUT/PATCH /api/foods/{food}
     */
    public function update(FoodUpdateRequest $request, Food $food): JsonResponse
    {
        $food->update($request->validated());

        return response()->json([
            'message' => 'Food updated successfully.',
            'data'    => $food->refresh(),
        ]);
    }

    /**
     * DELETE /api/foods/{food}
     */
    public function destroy(Food $food): JsonResponse
    {
        $food->delete();

        return response()->json([
            'message' => 'Food deleted successfully.',
        ], 204);
    }
}