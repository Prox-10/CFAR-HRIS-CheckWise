<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstname = $this->faker->firstName;
        $middlename = $this->faker->firstName;
        $lastname = $this->faker->lastName;

        return [
            'employeeid' => $this->faker->unique()->numerify('00###'),
            'firstname' => $firstname,
            'middlename' => $middlename,
            'lastname' => $lastname,
            'employee_name' => "{$firstname} {$middlename} {$lastname}",
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->numerify('09#########'),
            'department' => $this->faker->randomElement([
                'Monthly',
                'Packing',
                'Harvest',
                'PDC',
                'Coop Area',
                'Engineering',
            ]),
            'position' => $this->faker->randomElement([
                'Admin Assistant',
                'Accountant',
                'HR Officer',
                'Quality Inspector',
                'Production Supervisor',
                'Field Worker',
                'Field Supervisor',
                'Logistics Coordinator',
                'R&D Specialist',
                'Sales Executive',
                'Maintenance Technician',
                'P&D',
            ]),
            'marital_status' => $this->faker->randomElement(['Single', 'Married', 'Divorced', 'Widowed', 'Separated']),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'work_status' => $this->faker->randomElement(['Regular', 'Add Crew','Probationary', 'Sessional']),
            'service_tenure' => $this->faker->date(),
            'date_of_birth' => $this->faker->date(),
            'picture' => null,
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            // Keep country consistent with project context
            'country' => 'Philippines',
            'zip_code' => $this->faker->postcode(),
            'nationality' => 'Filipino',
        ];
    }
}
