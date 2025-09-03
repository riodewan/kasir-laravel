<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory;
    protected $fillable = ['order_id','food_id','quantity','price'];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function food() {
        return $this->belongsTo(Food::class);
    }
}
