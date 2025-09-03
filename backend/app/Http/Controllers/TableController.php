<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\JsonResponse;

class TableController extends Controller
{
    /**
     * GET /api/tables (public — guest can see available/occupied)
     */
    public function index(): JsonResponse
    {
        $tables = Table::query()
            ->select(['id', 'number', 'status'])
            ->orderBy('number')
            ->get();

        return response()->json([
            'message' => 'Tables fetched successfully.',
            'data'    => $tables,
        ]);
    }
}
