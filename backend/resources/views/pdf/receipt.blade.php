<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt #{{ $order->id }}</title>
  <style>
    @page { margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: DejaVu Sans, Arial, sans-serif;
      color: #222; font-size: 12px; line-height: 1.45;
      /* Thermal 80mm? aktifkan:
      width: 80mm; margin: 0 auto;
      */
    }
    h1,h2,h3,h4,h5 { margin: 0; }
    .brand { text-align:center; margin-bottom:10px; }
    .brand .name { font-weight:800; font-size:18px; letter-spacing:.5px; }
    .brand .meta { font-size:11px; color:#666; margin-top:2px; }

    .meta-block{ margin:12px 0 10px; padding:8px 10px; border:1px solid #eee; border-radius:6px; display:table; width:100%; }
    .row{ display:table-row; }
    .cell{ display:table-cell; padding:2px 0; vertical-align:top; }
    .cell.label{ color:#666; width:28%; }
    .cell.value{ font-weight:600; }

    .status-badge{ display:inline-block; padding:3px 8px; border-radius:999px; font-size:11px; border:1px solid #ddd; }
    .status-open{ color:#AF6A00; background:#FFF7E6; border-color:#F5D7A3; }
    .status-closed{ color:#0B6B3A; background:#E9F7EF; border-color:#BEE5CE; }

    table.items{ width:100%; border-collapse:collapse; margin-top:8px; }
    table.items thead th{ text-align:left; font-size:11px; color:#666; padding:6px 8px; border-bottom:1px solid #eaeaea; }
    table.items tbody td{ padding:8px; vertical-align:top; border-bottom:1px dashed #eee; }
    .ta-right{ text-align:right; } .ta-center{ text-align:center; }

    .totals{ margin-top:8px; width:100%; border-collapse:collapse; }
    .totals td{ padding:4px 8px; }
    .totals .label{ color:#666; }
    .totals .value{ text-align:right; font-weight:800; }

    .note{ margin-top:12px; padding-top:8px; border-top:1px solid #eee; font-size:11px; color:#666; text-align:center; }

    .stamp{ position:absolute; top:14mm; right:14mm; padding:4px 10px; border:2px solid #0B6B3A;
      color:#0B6B3A; font-weight:800; font-size:12px; border-radius:4px; transform:rotate(-8deg); }
  </style>
</head>
<body>
@php
  $nf = fn($v) => number_format((float)$v, 0, ',', '.');
  $tableNumber = optional($order->table)->number ?? $order->table_id;

  // === GROUPED ITEMS (by food_id + price) ===
  $grouped = collect($order->items)
    ->groupBy(fn($it) => $it->food_id.'@'.$it->price)
    ->map(function($grp){
      $first = $grp->first();
      return (object)[
        'food' => $first->food,
        'price' => (float)$first->price,
        'qty' => (int)$grp->sum('quantity'),
      ];
    })
    ->values();

  $itemsTotal = $grouped->sum(fn($g) => $g->qty * $g->price);
@endphp

@if($order->status === 'closed')
  <div class="stamp">PAID</div>
@endif

<div class="brand">
  <div class="name">RestoPOS</div>
  <div class="meta">Jl. Contoh No. 123, Kota • +62 812-3456-7890</div>
</div>

<div class="meta-block">
  <div class="row"><div class="cell label">Receipt</div><div class="cell value">#{{ $order->id }}</div></div>
  <div class="row"><div class="cell label">Date</div><div class="cell value">{{ $order->created_at?->format('d M Y H:i') }}</div></div>
  <div class="row"><div class="cell label">Table</div><div class="cell value">#{{ $tableNumber }}</div></div>
  <div class="row">
    <div class="cell label">Status</div>
    <div class="cell value">
      <span class="status-badge {{ $order->status === 'closed' ? 'status-closed' : 'status-open' }}">
        {{ strtoupper($order->status) }}
      </span>
    </div>
  </div>
</div>

<table class="items">
  <thead>
    <tr>
      <th>Item</th>
      <th class="ta-center" style="width:40px;">Qty</th>
      <th class="ta-right"  style="width:80px;">Price</th>
      <th class="ta-right"  style="width:90px;">Subtotal</th>
    </tr>
  </thead>
  <tbody>
    @foreach($grouped as $g)
      <tr>
        <td>
          <strong>{{ $g->food->name }}</strong><br>
          <span style="color:#888;font-size:11px;">@ {{ $nf($g->price) }}</span>
        </td>
        <td class="ta-center">{{ $g->qty }}</td>
        <td class="ta-right">{{ $nf($g->price) }}</td>
        <td class="ta-right">{{ $nf($g->qty * $g->price) }}</td>
      </tr>
    @endforeach
  </tbody>
</table>

<table class="totals">
  <tr>
    <td class="label" style="width:70%;">Subtotal</td>
    <td class="value">{{ $nf($itemsTotal) }}</td>
  </tr>
  {{-- Pajak/biaya layanan jika diperlukan:
  @php $tax = round($itemsTotal * 0.1); @endphp
  <tr><td class="label">Tax (10%)</td><td class="value">{{ $nf($tax) }}</td></tr>
  @php $grand = $itemsTotal + $tax; @endphp
  --}}
  <tr>
    <td class="label" style="padding-top:6px;border-top:1px solid #eaeaea;"><strong>Total</strong></td>
    <td class="value" style="padding-top:6px;border-top:1px solid #eaeaea;">
      <strong>{{ $nf($order->total) }}</strong>
    </td>
  </tr>
</table>

<div class="note">
  Terima kasih telah berkunjung. Simpan struk ini sebagai bukti pembayaran.
</div>
</body>
</html>