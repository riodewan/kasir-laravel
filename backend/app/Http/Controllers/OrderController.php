<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use App\Models\Food;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Requests\OrderOpenRequest;
use App\Http\Requests\OrderAddItemRequest;

class OrderController extends Controller
{
    /**
     * GET /api/orders
     * Eager-load to avoid N+1.
     */
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->with(['table', 'items.food'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'message' => 'Orders fetched successfully.',
            'data'    => $orders,
        ]);
    }

    /**
     * POST /api/orders/open
     * Body: { "table_id": number }
     * Uses transaction + row-level lock to ensure table availability.
     */
    public function open(OrderOpenRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $order = DB::transaction(function () use ($payload) {
            /** @var Table $table */
            $table = Table::lockForUpdate()->find($payload['table_id']);
            abort_if(!$table, 404, 'Table not found.');
            abort_if($table->status !== 'available', 422, 'Table is not available.');

            $order = Order::create([
                'table_id' => $table->id,
                'status'   => 'open',
                'total'    => 0,
            ]);

            $table->update(['status' => 'occupied']);

            return $order->load('table');
        });

        return response()->json([
            'message' => 'Order opened successfully.',
            'data'    => $order,
        ], 201);
    }

    /**
     * GET /api/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['table', 'items.food']);

        return response()->json([
            'message' => 'Order fetched successfully.',
            'data'    => $order,
        ]);
    }

    /**
     * POST /api/orders/{order}/items
     * Body: { "food_id": number, "quantity": number }
     * Uses transaction; recompute total safely in DB.
     */
    public function addItem(OrderAddItemRequest $request, Order $order): JsonResponse
    {
        abort_if($order->status !== 'open', 422, 'Order already closed.');

        $payload = $request->validated();

        $order = DB::transaction(function () use ($order, $payload) {
            $food = Food::findOrFail($payload['food_id']);

            OrderItem::create([
                'order_id' => $order->id,
                'food_id'  => $food->id,
                'quantity' => $payload['quantity'],
                'price'    => $food->price, // snapshot price
            ]);

            // Recalculate total (in DB to avoid race conditions)
            $total = $order->items()->sum(DB::raw('quantity * price'));
            $order->update(['total' => $total]);

            return $order->fresh()->load(['table', 'items.food']);
        });

        return response()->json([
            'message' => 'Item added to order successfully.',
            'data'    => $order,
        ], 201);
    }

    /**
     * POST /api/orders/{order}/close
     * Optional: protect with role middleware (e.g., cashier only).
     */
    public function close(Order $order): JsonResponse
    {
        abort_if($order->status !== 'open', 422, 'Order already closed.');

        $order = DB::transaction(function () use ($order) {
            $total = $order->items()->sum(DB::raw('quantity * price'));
            $order->update([
                'status' => 'closed',
                'total'  => $total,
            ]);

            $order->table()->update(['status' => 'available']);

            return $order->fresh()->load(['table', 'items.food']);
        });

        return response()->json([
            'message' => 'Order closed successfully.',
            'data'    => $order,
        ]);
    }

    /**
     * GET /api/orders/{order}/receipt
     * Returns PDF download.
     */
    public function receipt(Order $order)
    {
        $order->load(['table', 'items.food']);

        $pdf = Pdf::loadView('pdf.receipt', ['order' => $order]);

        return $pdf->download("receipt-order-{$order->id}.pdf");
    }
}