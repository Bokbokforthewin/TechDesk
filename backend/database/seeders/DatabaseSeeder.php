<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        // 1. Seed ICTU Personnel (For task assignment and dashboard management)
        DB::table('users')->insert([
            'name' => 'Juan Dela Cruz (ICTU)',
            'email' => 'juan.ictu@example.com',
            'password' => Hash::make('password123'),
            'designation' => 'IT Specialist',
            'unit' => 'ICT Unit',
            'division' => 'Admin Division',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 2. Seed End User (For submitting requests and CSF)
        DB::table('users')->insert([
            'name' => 'Maria Clara (End User)',
            'email' => 'maria.user@example.com',
            'password' => Hash::make('password123'),
            'designation' => 'Administrative Officer',
            'unit' => 'HR Unit',
            'division' => 'Admin Division',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
