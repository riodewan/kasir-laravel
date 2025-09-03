<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; 
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email'=>'pelayan@test.com'],
            ['name'=>'Pelayan Satu','password'=>Hash::make('password'),'role'=>'waiter']
        );

        User::updateOrCreate(
            ['email'=>'kasir@test.com'],
            ['name'=>'Kasir Satu','password'=>Hash::make('password'),'role'=>'cashier']
        );
    }
}
