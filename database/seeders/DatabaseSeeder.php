<?php

namespace Database\Seeders;

use App\Models\Leave;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            'name' => 'Admin User',
            'email' => 'kyledev10282001@gmail.com',
            'password' => Hash::make('10282001'),  // hashed password
        ]);
        // Seed employees first if not present
        if (\App\Models\Employee::count() === 0) {
            \App\Models\Employee::factory(10)->create();
        }
        // Seed evaluations
        \App\Models\Employee::factory(10)->create();
        $this->call([
            EmployeeSeeder::class,
        ]);
        // \App\Models\Evaluation::factory(30)->create();
        // $this->call([
        //     EvaluationSeeder::class,
        // ]);
        // \App\Models\Attendance::factory()->create();
        // $this->call([
        //     AttendanceSeeder::class,
        // ]);
        $this->call([
            LeaveSeeder::class,
        ]);
    }
}
