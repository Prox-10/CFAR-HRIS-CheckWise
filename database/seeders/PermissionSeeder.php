<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Create permissions
    $permissions = [
      // Dashboard permissions
      'view-dashboard',

      // Employee permissions
      'view-employee',
      'create-employee',
      'edit-employee',
      'delete-employee',

      // Attendance permissions
      'view-attendance',
      'create-attendance',
      'edit-attendance',
      'delete-attendance',

      // Evaluation permissions
      'view-evaluation',
      'create-evaluation',
      'edit-evaluation',
      'delete-evaluation',

      // Leave permissions
      'view-leave',
      'create-leave',
      'edit-leave',
      'delete-leave',

      // Service Tenure permissions
      'view-service-tenure',
      'create-service-tenure',
      'edit-service-tenure',
      'delete-service-tenure',

      // Report permissions
      'view-report',
      'create-report',
      'edit-report',
      'delete-report',

      // User Management permissions
      'view-user-management',
      'view-users',
      'create-users',
      'edit-users',
      'delete-users',

      // Role Management permissions
      'view-role-management',
      'view-roles',
      'create-roles',
      'edit-roles',
      'delete-roles',

      // Permission Control permissions
      'view-permission-control',
      'view-permissions',
      'create-permissions',
      'edit-permissions',
      'delete-permissions',

      // Access Management permissions
      'view-access',
      'create-access',
      'edit-access',
      'delete-access',

      // Permission Settings permissions
      'view-permission-settings',
      'edit-permission-settings',
    ];

    foreach ($permissions as $permission) {
      Permission::firstOrCreate(['name' => $permission]);
    }

    // Create roles and assign permissions
    $roles = [
      'Super Admin' => $permissions, // All permissions
      'Admin' => [
        'view-dashboard',
        'view-employee',
        'create-employee',
        'edit-employee',
        'delete-employee',
        'view-attendance',
        'create-attendance',
        'edit-attendance',
        'delete-attendance',
        'view-evaluation',
        'create-evaluation',
        'edit-evaluation',
        'delete-evaluation',
        'view-leave',
        'create-leave',
        'edit-leave',
        'delete-leave',
        'view-service-tenure',
        'create-service-tenure',
        'edit-service-tenure',
        'delete-service-tenure',
        'view-report',
        'create-report',
        'edit-report',
        'delete-report',
        'view-user-management',
        'view-users',
        'create-users',
        'edit-users',
        'delete-users',
        'view-role-management',
        'view-roles',
        'create-roles',
        'edit-roles',
        'delete-roles',
        'view-permission-control',
        'view-permissions',
        'create-permissions',
        'edit-permissions',
        'delete-permissions',
        'view-access',
        'create-access',
        'edit-access',
        'delete-access',
        'view-permission-settings',
        'edit-permission-settings',
      ],
      'HR' => [
        'view-dashboard',
        'view-employee',
        'create-employee',
        'edit-employee',
        'view-attendance',
        'create-attendance',
        'edit-attendance',
        'view-evaluation',
        'create-evaluation',
        'edit-evaluation',
        'view-leave',
        'create-leave',
        'edit-leave',
        'view-service-tenure',
        'create-service-tenure',
        'edit-service-tenure',
        'view-report',
        'create-report',
        'edit-report',
        'view-user-management',
        'view-users',
        'create-users',
        'edit-users',
        'view-role-management',
        'view-roles',
        'create-roles',
        'edit-roles',
        'view-permission-control',
        'view-permissions',
        'create-permissions',
        'edit-permissions',
        'view-access',
        'create-access',
        'edit-access',
        'view-permission-settings',
      ],
      'Supervisor' => [
        'view-dashboard',
        'view-employee',
        'edit-employee',
        'view-attendance',
        'create-attendance',
        'edit-attendance',
        'view-evaluation',
        'create-evaluation',
        'edit-evaluation',
        'view-leave',
        'create-leave',
        'edit-leave',
        'view-service-tenure',
        'edit-service-tenure',
        'view-report',
        'create-report',
        'view-user-management',
        'view-users',
        'edit-users',
        'view-role-management',
        'view-roles',
        'view-permission-control',
        'view-permissions',
        'view-access',
      ],
    ];

    foreach ($roles as $roleName => $rolePermissions) {
      $role = Role::firstOrCreate(['name' => $roleName]);
      $role->syncPermissions($rolePermissions);
    }

    $this->command->info('Permissions and roles seeded successfully!');
  }
}
