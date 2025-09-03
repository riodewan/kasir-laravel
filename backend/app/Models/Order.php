<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['table_id','status','total'];

    public function table() {
        return $this->belongsTo(Table::class);
    }

    public function items() {
        return $this->hasMany(OrderItem::class);
    }
}
