<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TableController extends Controller
{
    /**
     * GET /api/tables (public)
     * Query params (opsional):
     * - status: available|occupied
     * - paginate: 1 (aktifkan pagination)
     * - per_page: 1..100 (default 20, jika paginate=1)
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status'   => ['sometimes', 'string', Rule::in(['available', 'occupied'])],
            'paginate' => ['sometimes', 'boolean'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $q = Table::query()
            ->select(['id', 'number', 'status'])
            ->when(isset($data['status']), fn ($qq) => $qq->where('status', $data['status']))
            ->orderBy('number');

        if (!empty($data['paginate'])) {
            $perPage = $data['per_page'] ?? 20;
            $tables = $q->paginate($perPage);

            return response()->json([
                'message' => 'Tables fetched successfully.',
                'data'    => $tables, // paginator object
            ]);
        }

        // default: non-paginated (sesuai konsumsi FE sekarang)
        $tables = $q->get();

        return response()->json([
            'message' => 'Tables fetched successfully.',
            'data'    => $tables,
        ]);
    }
}