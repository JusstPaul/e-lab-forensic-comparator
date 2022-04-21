<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run()
    {
        $user = User::create([
            'username' => 'admin',
            'password' => Hash::make(env('DEFAULT_PASSWORD', 'passwd')),
            'remember_token' => Str::random(10),
        ]);

        $user->assignRole('admin');
    }
}
