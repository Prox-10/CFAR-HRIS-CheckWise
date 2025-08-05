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

        // Create the main developer user
        User::firstOrCreate(
            ['email' => 'kyledev10282001@gmail.com'],
            [
                'firstname' => 'Kyle',
                'middlename' => 'Dev',
                'lastname' => 'Labz',
                'email' => 'kyledev10282001@gmail.com',
                'password' => Hash::make('10282001'),
                'email_verified_at' => now(),
            ]
        )->assignRole('Super Admin');
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
        // Run PermissionSeeder first to create roles and permissions
        $this->call(PermissionSeeder::class);

        // Then run other seeders
        $this->call([
            LeaveSeeder::class,
            UserSeeder::class,
        ]);
    }
}
