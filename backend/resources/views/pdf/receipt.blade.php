<html>
  <body>
    <h2>Receipt #{{ $order->id }}</h2>
    <p>Table: {{ $order->table->number }}</p>
    <table width="100%" border="1" cellspacing="0" cellpadding="6">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>
        @foreach($order->items as $it)
        <tr>
          <td>{{ $it->food->name }}</td>
          <td>{{ $it->quantity }}</td>
          <td>{{ number_format($it->price) }}</td>
          <td>{{ number_format($it->quantity * $it->price) }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>
    <h3>Total: {{ number_format($order->total) }}</h3>
  </body>
</html>
