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

class OrderController extends Controller
{
    /**
     * GET /api/orders
     */
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->with(['table', 'items.food'])
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'message' => 'Orders fetched successfully.',
            'data'    => $orders,
        ]);
    }

    /**
     * POST /api/orders/open
     * Body: { "table_id": number }
     */
    public function open(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'table_id' => ['required','integer','exists:tables,id'],
        ]);

        $order = DB::transaction(function () use ($payload) {
            /** @var Table|null $table */
            $table = Table::lockForUpdate()->find($payload['table_id']);
            abort_if(!$table, 404, 'Table not found.');
            abort_if($table->status !== 'available', 422, 'Table is not available.');

            $hasOpen = Order::where('table_id', $table->id)->where('status', 'open')->exists();
            abort_if($hasOpen, 422, 'An open order already exists for this table.');

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
     */
    public function addItem(Request $request, Order $order): JsonResponse
    {
        $payload = $request->validate([
            'food_id'  => ['required','integer','exists:foods,id'],
            'quantity' => ['required','integer','min:1'],
        ]);

        $order = DB::transaction(function () use ($order, $payload) {
            /** @var Order $locked */
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->status !== 'open', 422, 'Order already closed.');

            $food = Food::findOrFail($payload['food_id']);

            OrderItem::create([
                'order_id' => $locked->id,
                'food_id'  => $food->id,
                'quantity' => (int) $payload['quantity'],
                'price'    => $food->price, // snapshot
            ]);

            $total = $locked->items()->sum(DB::raw('quantity * price'));
            $locked->update(['total' => $total]);

            return $locked->fresh()->load(['table', 'items.food']);
        });

        return response()->json([
            'message' => 'Item added to order successfully.',
            'data'    => $order,
        ], 201);
    }

    /**
     * POST /api/orders/{order}/close
     */
    public function close(Order $order): JsonResponse
    {
        $order = DB::transaction(function () use ($order) {
            /** @var Order $locked */
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->status !== 'open', 422, 'Order already closed.');

            $total = $locked->items()->sum(DB::raw('quantity * price'));
            $locked->update([
                'status' => 'closed',
                'total'  => $total,
            ]);

            $locked->table()->update(['status' => 'available']);

            return $locked->fresh()->load(['table', 'items.food']);
        });

        return response()->json([
            'message' => 'Order closed successfully.',
            'data'    => $order,
        ]);
    }

    /**
     * GET /api/orders/{order}/receipt
     */
    public function receipt(Order $order)
    {
        abort_if($order->status !== 'closed', 422, 'Receipt is available only for closed orders.');

        $order->load(['table', 'items.food']);

        $pdf = Pdf::loadView('pdf.receipt', ['order' => $order]);

        return $pdf->download("receipt-order-{$order->id}.pdf");
    }
}