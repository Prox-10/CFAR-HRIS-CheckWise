<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Roles should already be created by PermissionSeeder
    // We'll just assign roles to users

    // Create admin user
    $admin = User::firstOrCreate(
      ['email' => 'admin@example.com'],
      [
        'firstname' => 'Super',
        'lastname' => 'Admin',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'email_verified_at' => now(),
      ]
    );

    // Check if role exists before assigning
    if (Role::where('name', 'Super Admin')->exists()) {
      $admin->assignRole('Super Admin');
    } else {
      $this->command->warn('Super Admin role not found. Skipping role assignment.');
    }

    // Create HR Manager
    $hrManager = User::firstOrCreate(
      ['email' => 'hr@example.com'],
      [
        'firstname' => 'HR',
        'lastname' => 'Manager',
        'email' => 'hr@example.com',
        'password' => bcrypt('password'),
        'email_verified_at' => now(),
      ]
    );

    if (Role::where('name', 'HR Manager')->exists()) {
      $hrManager->assignRole('HR Manager');
    } else {
      $this->command->warn('HR Manager role not found. Skipping role assignment.');
    }

    // Create Supervisor
    $supervisor = User::firstOrCreate(
      ['email' => 'supervisor@example.com'],
      [
        'firstname' => 'Department',
        'lastname' => 'Supervisor',
        'email' => 'supervisor@example.com',
        'password' => bcrypt('password'),
        'email_verified_at' => now(),
      ]
    );

    if (Role::where('name', 'Supervisor')->exists()) {
      $supervisor->assignRole('Supervisor');
    } else {
      $this->command->warn('Supervisor role not found. Skipping role assignment.');
    }

    // Create regular employees
    $employees = [
      [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'email' => 'john.doe@example.com',
        'roles' => ['Employee']
      ],
      [
        'firstname' => 'Jane',
        'lastname' => 'Smith',
        'email' => 'jane.smith@example.com',
        'roles' => ['Employee']
      ],
    
    ];

    foreach ($employees as $employeeData) {
      $roles = $employeeData['roles'];
      unset($employeeData['roles']);

      $user = User::firstOrCreate(
        ['email' => $employeeData['email']],
        array_merge($employeeData, [
          'password' => bcrypt('password'),
          'email_verified_at' => now(),
        ])
      );

      foreach ($roles as $roleName) {
        if (Role::where('name', $roleName)->exists()) {
          $user->assignRole($roleName);
        } else {
          $this->command->warn("Role '{$roleName}' not found. Skipping assignment for user {$user->email}.");
        }
      }
    }

    // Create some users with multiple roles
    $multiRoleUsers = [
      [
        'firstname' => 'Admin',
        'lastname' => 'User',
        'email' => 'adminuser@example.com',
        'roles' => ['Super Admin', 'Admin']
      ],
      [
        'firstname' => 'Meshel',
        'middlename' => 'A.',
        'lastname' => 'Basang',
        'email' => 'meshelbasang@gmail.com',
        'roles' => ['HR', 'Manager']
      ]
    ];

    foreach ($multiRoleUsers as $userData) {
      $roles = $userData['roles'];
      unset($userData['roles']);

      $user = User::firstOrCreate(
        ['email' => $userData['email']],
        array_merge($userData, [
          'password' => bcrypt('password'),
          'email_verified_at' => now(),
        ])
      );

      foreach ($roles as $roleName) {
        if (Role::where('name', $roleName)->exists()) {
          $user->assignRole($roleName);
        } else {
          $this->command->warn("Role '{$roleName}' not found. Skipping assignment for user {$user->email}.");
        }
      }
    }

    // Create additional random users using factory
    User::factory(2)->create()->each(function ($user) {
      // Randomly assign 1-2 roles to each user
      $roles = Role::inRandomOrder()->take(rand(1, 2))->get();
      if ($roles->count() > 0) {
        $user->assignRole($roles);
      } else {
        $this->command->warn("No roles found. Skipping role assignment for user {$user->email}.");
      }
    });

    $this->command->info('Users seeded successfully!');
    $this->command->info('Default login credentials:');
    $this->command->info('Admin: admin@example.com / password');
    $this->command->info('HR Manager: hr@example.com / password');
    $this->command->info('Supervisor: supervisor@example.com / password');
  }
}
