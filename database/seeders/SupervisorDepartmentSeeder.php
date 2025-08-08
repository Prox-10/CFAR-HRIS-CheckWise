<?php

namespace Database\Seeders;

use App\Models\SupervisorDepartment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SupervisorDepartmentSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Get or create supervisor role
    $supervisorRole = Role::firstOrCreate(['name' => 'Supervisor']);

    // Create sample supervisors if they don't exist
    $supervisors = [
      [
        'firstname' => 'John',
        'lastname' => 'Labrador',
        'email' => 'john.labrador@example.com',
        'password' => bcrypt('password'),
        'department' => 'Plantation',
      ],
      [
        'firstname' => 'Maria',
        'lastname' => 'Santos',
        'email' => 'maria.santos@example.com',
        'password' => bcrypt('password'),
        'department' => 'Production',
      ],
      [
        'firstname' => 'Carlos',
        'lastname' => 'Garcia',
        'email' => 'carlos.garcia@example.com',
        'password' => bcrypt('password'),
        'department' => 'Operations',
      ],
    ];

    foreach ($supervisors as $supervisorData) {
      $supervisor = User::firstOrCreate(
        ['email' => $supervisorData['email']],
        $supervisorData
      );

      // Assign supervisor role
      $supervisor->assignRole($supervisorRole);

      // Create supervisor-department assignment
      SupervisorDepartment::firstOrCreate(
        [
          'user_id' => $supervisor->id,
          'department' => $supervisorData['department'],
        ],
        [
          'can_evaluate' => true,
        ]
      );
    }

    $this->command->info('Supervisor department assignments seeded successfully!');
  }
}
