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
        $work_quality = $this->faker->numberBetween(1, 5);
        $safety_compliance = $this->faker->numberBetween(1, 5);
        $punctuality = $this->faker->numberBetween(1, 5);
        $teamwork = $this->faker->numberBetween(1, 5);
        $equipment_handling = $this->faker->numberBetween(1, 5);
        $organization = $this->faker->numberBetween(1, 5);
        $criteria = [$work_quality, $safety_compliance, $punctuality, $teamwork, $equipment_handling, $organization];
        $average = number_format(array_sum($criteria) / count($criteria), 1);
        return [
            'employee_id' => \App\Models\Employee::inRandomOrder()->first()?->id ?? 1,
            'ratings' => $average,
            'rating_date' => $this->faker->date(),
            'work_quality' => $work_quality,
            'safety_compliance' => $safety_compliance,
            'punctuality' => $punctuality,
            'teamwork' => $teamwork,
            'organization' => $this->faker->company,
            'equipment_handling' => $equipment_handling,
            'organization' => $organization,
            'comment' => $this->faker->sentence(),
        ];
    }
}
