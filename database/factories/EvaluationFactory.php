<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Evaluation>
 */
class EvaluationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate realistic evaluation scores with bias towards higher ratings for recognition
        $work_quality = $this->faker->numberBetween(7, 10); // Higher range for recognition
        $safety_compliance = $this->faker->numberBetween(7, 10);
        $punctuality = $this->faker->numberBetween(7, 10);
        $teamwork = $this->faker->numberBetween(7, 10);
        $equipment_handling = $this->faker->numberBetween(7, 10);
        $organization = $this->faker->numberBetween(7, 10);
        $criteria = [$work_quality, $safety_compliance, $punctuality, $teamwork, $equipment_handling, $organization];
        $average = number_format(array_sum($criteria) / count($criteria), 1);

        // Generate random period (1 for Jan-Jun, 2 for Jul-Dec)
        $period = $this->faker->randomElement([1, 2]);
        $year = $this->faker->randomElement([2024, 2025]);

        return [
            'employee_id' => \App\Models\Employee::inRandomOrder()->first()?->id ?? 1,
            'department' => $this->faker->randomElement(['Monthly', 'Packing', 'Harvest', 'PDC', 'Coop Area', 'Engineering']),
            'evaluation_frequency' => $this->faker->randomElement(['semi_annual', 'annual']),
            'evaluator' => $this->faker->name(),
            'observations' => $this->faker->paragraph(),
            'total_rating' => (float) $average,
            'evaluation_year' => $year,
            'evaluation_period' => $period,
            'rating_date' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
        ];
    }
}
