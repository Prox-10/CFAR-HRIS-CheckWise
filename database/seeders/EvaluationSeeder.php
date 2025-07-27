<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EvaluationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = \App\Models\Employee::all();
        foreach ($employees as $employee) {
            \App\Models\Evaluation::factory()->create(['employee_id' => $employee->id]);
        }
    }
}
