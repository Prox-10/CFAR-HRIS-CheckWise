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
            'employeeid' => $this->faker->unique()->numerify('EMP1028####'),
            'firstname' => $firstname,
            'middlename' => $middlename,
            'lastname' => $lastname,
            'employee_name' => "{$firstname} {$middlename} {$lastname}",
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->numerify('09#########'),
            'department' => $this->faker->randomElement(['Admin', 'Packing Plant', 'Harvesting', 'Coop Area', 'P&D','Engineering', 'Utility']),
            'position' => $this->faker->randomElement([
                'Harvester',
                'Accounting',
                'Cashier',
                'Finance(Payroll)',
                'Manager',
                'Supervisor',
                'Packer',
                'P&D',]),
            'status' => $this->faker->randomElement(['Single', 'Married', 'Divorced']),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'work_status' => $this->faker->randomElement(['Regular', 'Add Crew']),
            'service_tenure' => $this->faker->date(),
            'date_of_birth' => $this->faker->date(),
            'picture' => null, // or put placeholder url if needed
        ];
    }
}
