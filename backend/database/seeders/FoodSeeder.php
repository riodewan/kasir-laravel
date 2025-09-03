<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Food;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void {
        $rows = [
            ['name'=>'Fried Rice','price'=>20000,'category'=>'food'],
            ['name'=>'Chicken Noodle','price'=>18000,'category'=>'food'],
            ['name'=>'Iced Tea','price'=>8000,'category'=>'drink'],
        ];
        foreach ($rows as $r) { Food::updateOrCreate(['name'=>$r['name']], $r); }
    }
}
