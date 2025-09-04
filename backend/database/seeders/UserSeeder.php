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
            ['email'=>'waiter@test.com'],
            ['name'=>'Waiter','password'=>Hash::make('password'),'role'=>'waiter']
        );

        User::updateOrCreate(
            ['email'=>'cashier@test.com'],
            ['name'=>'Cashier','password'=>Hash::make('password'),'role'=>'cashier']
        );
    }
}
