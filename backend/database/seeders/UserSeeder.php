<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User; 
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(['email'=>'pelayan@test.com'],[
            'name'=>'Pelayan Satu','password'=>Hash::make('password'),'role'=>'pelayan'
        ]);
        User::updateOrCreate(['email'=>'kasir@test.com'],[
            'name'=>'Kasir Satu','password'=>Hash::make('password'),'role'=>'kasir'
        ]);
    }
}
