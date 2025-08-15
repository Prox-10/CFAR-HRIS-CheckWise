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
        $work_quality = $this->faker->numberBetween(1, 10);
        $safety_compliance = $this->faker->numberBetween(1, 10);
        $punctuality = $this->faker->numberBetween(1, 10);
        $teamwork = $this->faker->numberBetween(1, 10);
        $equipment_handling = $this->faker->numberBetween(1, 10);
        $organization = $this->faker->numberBetween(1, 10);
        $criteria = [$work_quality, $safety_compliance, $punctuality, $teamwork, $equipment_handling, $organization];
        $average = number_format(array_sum($criteria) / count($criteria), 1);

        // Generate random period (1 for Jan-Jun, 2 for Jul-Dec)
        $period = $this->faker->randomElement([1, 2]);

        return [
            'employee_id' => \App\Models\Employee::inRandomOrder()->first()?->id ?? 1,
            'ratings' => $average,
            'rating_date' => $this->faker->date(),
            'work_quality' => $work_quality,
            'safety_compliance' => $safety_compliance,
            'punctuality' => $punctuality,
            'teamwork' => $teamwork,
            'organization' => $organization,
            'equipment_handling' => $equipment_handling,
            'comment' => $this->faker->sentence(),
            'period' => $period,
            'year' => $this->faker->numberBetween(2023, 2025),
        ];
    }
}
