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
        'firstname' => 'RJ Kyle',
        'lastname' => 'Labrador',
        'email' => 'rjkylegepolongcalabrador@gmail.com',
        'password' => bcrypt('10282001'),
        'department' => 'Management & Staff(Admin)',
      ],
      [
        'firstname' => 'Rovilyn',
        'middlename' => 'B.',
        'lastname' => 'Villanueva',
        'email' => 'rovilynvillanueva@gmail.com',
        'password' => bcrypt('10282001'),
        // 'roles' => ['HR Personnel']
         'department' => 'HR Personnel',
      ],
      [
        'firstname' => 'Ronelito',
        'middlename' => '',
        'lastname' => 'Mulato',
        'email' => 'ronelitomulato@gmail.com',
        'password' => bcrypt('10282001'),
        // 'roles' => ['Farm Supervisor']
         'department' => 'Farm Supervisor',
        
      ],
      [
        'firstname' => 'Nestor',
        'middlename' => 'C.',
        'lastname' => 'Geraga',
        'email' => 'nestorcgeraga@gmail.com',
        'password' => bcrypt('10282001'),
        'department' => 'P&D Supervisor',
      ],
      [
        'firstname' => 'Marcelo',
        'middlename' => '',
        'lastname' => 'Milana',
        'email' => 'marcelomilana@gmail.com',
        'password' => bcrypt('10282001'),
        'department' => 'Packing Plant Supervisor'
      ],
      [
        'firstname' => 'Jeah Pearl',
        'middlename' => '',
        'lastname' => 'Cabal',
        'email' => 'jeahpearlcabal@gmail.com',
        'password' => bcrypt('10282001'),
        'department' => 'PP Asst. Supervisor'
      ],
      [
        'firstname' => 'Norberto',
        'middlename' => 'O.',
        'lastname' => 'Aguilar',
        'email' => 'norbertooaguilar@gmail.com',
        'password' => bcrypt('10282001'),
        'department' => 'Harvesting Supervisor'
      ],
      [
        'firstname' => 'LP',
        'middlename' => '',
        'lastname' => 'Subayno',
        'email' => 'lpsubayno@gmail.com',
        'password' => bcrypt('10282001'),
        'department' => 'ACCTG. Head'
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
