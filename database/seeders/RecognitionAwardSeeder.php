<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use App\Models\Employee;
use App\Models\EvaluationConfiguration;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RecognitionAwardSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $this->command->info('Seeding recognition award test data...');

    // Ensure evaluation configurations exist
    $departments = ['Monthly', 'Packing', 'Harvest', 'PDC', 'Coop Area', 'Engineering'];
    foreach ($departments as $department) {
      EvaluationConfiguration::updateOrCreate(
        ['department' => $department],
        ['evaluation_frequency' => 'semi_annual']
      );
    }

    // Get all employees
    $employees = Employee::all();

    if ($employees->isEmpty()) {
      $this->command->warn('No employees found. Please run EmployeeSeeder first.');
      return;
    }

    $this->command->info("Found {$employees->count()} employees. Creating evaluation data...");

    $currentYear = now()->year;
    $currentPeriod = now()->month <= 6 ? 1 : 2;

    foreach ($employees as $employee) {
      // Create evaluation for current period with high ratings for recognition
      $this->createHighRatingEvaluation($employee, $currentYear, $currentPeriod);

      // Create evaluation for previous period (if different)
      if ($currentPeriod === 1) {
        $this->createHighRatingEvaluation($employee, $currentYear - 1, 2);
      } else {
        $this->createHighRatingEvaluation($employee, $currentYear, 1);
      }
    }

    $this->command->info('Recognition award test data seeded successfully!');
    $this->command->info('Employees with ratings 8.0+ will appear in the recognition awards section.');
  }

  /**
   * Create a high-rating evaluation for recognition testing
   */
  private function createHighRatingEvaluation($employee, $year, $period)
  {
    // Check if evaluation already exists
    $existingEvaluation = Evaluation::where('employee_id', $employee->id)
      ->where('evaluation_year', $year)
      ->where('evaluation_period', $period)
      ->first();

    if ($existingEvaluation) {
      $this->command->info("Evaluation already exists for {$employee->employee_name} - {$year} Period {$period}");
      return;
    }

    // Generate high ratings (8.0-10.0) for recognition eligibility
    $work_quality = rand(8, 10);
    $safety_compliance = rand(8, 10);
    $punctuality = rand(8, 10);
    $teamwork = rand(8, 10);
    $equipment_handling = rand(8, 10);
    $organization = rand(8, 10);

    $criteria = [$work_quality, $safety_compliance, $punctuality, $teamwork, $equipment_handling, $organization];
    $totalRating = round(array_sum($criteria) / count($criteria), 1);

    // Determine rating date based on period
    $ratingDate = $period === 1 ? "{$year}-06-30" : "{$year}-12-31";

    $evaluation = Evaluation::create([
      'employee_id' => $employee->id,
      'department' => $employee->department,
      'evaluation_frequency' => EvaluationConfiguration::getFrequencyForDepartment($employee->department),
      'evaluator' => 'Test Evaluator',
      'observations' => "Excellent performance evaluation for recognition testing. Employee demonstrates outstanding work quality and dedication.",
      'total_rating' => $totalRating,
      'evaluation_year' => $year,
      'evaluation_period' => $period,
      'rating_date' => $ratingDate,
    ]);

    $this->command->info("Created evaluation for {$employee->employee_name}: Rating {$totalRating}/10 - {$year} Period {$period}");
  }
}
