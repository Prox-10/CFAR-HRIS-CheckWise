<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use App\Models\EvaluationConfiguration;
use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EvaluationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create evaluation configurations for departments
        $departments = Employee::distinct()->pluck('department')->filter()->toArray();

        foreach ($departments as $department) {
            // Randomly assign evaluation frequency (70% semi-annual, 30% annual)
            $frequency = rand(1, 10) <= 7 ? 'semi_annual' : 'annual';

            EvaluationConfiguration::create([
                'department' => $department,
                'evaluation_frequency' => $frequency,
            ]);
        }

        // Create evaluations for employees
        $employees = Employee::all();
        foreach ($employees as $employee) {
            // Create 1-3 evaluations per employee (different periods/years)
            $numEvaluations = rand(1, 3);

            for ($i = 0; $i < $numEvaluations; $i++) {
                $year = rand(2023, 2025);
                $period = rand(1, 2);

                // Check if evaluation already exists for this period/year
                $exists = Evaluation::where('employee_id', $employee->id)
                    ->where('period', $period)
                    ->where('year', $year)
                    ->exists();

                if (!$exists) {
                    Evaluation::factory()->create([
                        'employee_id' => $employee->id,
                        'period' => $period,
                        'year' => $year,
                    ]);
                }
            }
        }
    }
}
