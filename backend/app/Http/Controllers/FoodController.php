<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FoodController extends Controller
{
    /**
     * GET /api/foods
     */
    public function index(): JsonResponse
    {
        $foods = Food::query()
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'message' => 'Foods fetched successfully.',
            'data'    => $foods,
        ]);
    }

    /**
     * POST /api/foods
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required','string','max:100', Rule::unique('foods','name')],
            'price'    => ['required','numeric','min:0'],
            'category' => ['nullable','string','max:100'],
        ]);

        $food = Food::create($data);

        return response()->json([
            'message' => 'Food created successfully.',
            'data'    => $food->fresh(),
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
    public function update(Request $request, Food $food): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['sometimes','string','max:100', Rule::unique('foods','name')->ignore($food->id)],
            'price'    => ['sometimes','numeric','min:0'],
            'category' => ['sometimes','nullable','string','max:100'],
        ]);

        $food->fill($data);
        if ($food->isDirty()) {
            $food->save();
        }

        return response()->json([
            'message' => 'Food updated successfully.',
            'data'    => $food->refresh(),
        ]);
    }

    /**
     * DELETE /api/foods/{food}
     */
    public function destroy(Food $food): Response
    {
        $food->delete();
        return response()->noContent();
    }
}