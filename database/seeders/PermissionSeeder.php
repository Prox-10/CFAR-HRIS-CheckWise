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
      'View Dashboard',

      // Employee permissions
      'View Employee Details',
      'View Employee',
      'Add Employee',
      'Update Employee',
      'Delete Employee',
      'Refresh Employee',

      // Attendance permissions
      'View Attendance Details',
      'View Attendance',
      'Add Attendance',
      'Update Attendance',
      'Delete Attendance',
      'Set Session Times',

      // Evaluation permissions
      'View Evaluation Details',
      'View Evaluation',
      'Add Evaluation',
      'Update Evaluation',
      'Delete Evaluation',
      'Start Evaluation Rating',
      'Refresh Evaluation List',
      'View Evaluation By Department',

      // Leave permissions
      'View Leave',
      'View Leave Details',
      'Add Leave',
      'Update Leave',
      'Delete Leave',
      'Download Leave PDF',
      'Sent Email Approval',
      'Leave Status Approval',

      // Service Tenure permissions
      'View Service Tenure Management',
      'Add Service Tenure',
      'Update Service Tenure',
      'Delete Service Tenure',
      'View Service Tenure',
      'View Service Tenure Dashboard',
      'View Service Tenure Employee',
      'View Service Tenure Pay Advancement',
      'View Service Tenure Report',

      // Report permissions
      'View Report',
      'Add Report',
      'Update Report',
      'Delete Report',

      // User Management permissions
      'View Admin',
      'View Admin Details',
      'Add Admin',
      'Update Admin',
      'Delete Admin',

      // Role Management permissions
      'View Role',
      'View Roles Details',
      'Add Roles',
      'Update Roles',
      'Delete Roles',

      // Permission Control permissions
      'View Permission Details',
      'View Permission',
      'Add Permission',
      'Update Permission',
      'Delete Permission',

      // Absence permissions
      'View Absence',
      'View Absence Details',
      'Add Absence',
      'Update Absence',
      'Delete Absence',
      'Absence Request',

      // Access Management permissions
      'View Access',
    ];

    foreach ($permissions as $permission) {
      Permission::firstOrCreate(['name' => $permission]);
    }

    // Create roles and assign permissions
    $roles = [
      'Super Admin' => $permissions, // All permissions
      'HR' => $permissions, // All permissions
      'Manager' => $permissions, // All permissions
      'Supervisor' => [
        // Dashboard permissions
        'View Dashboard',

        // Evaluation permissions
        'View Evaluation Details',
        'View Evaluation',
        'Add Evaluation',
        'Update Evaluation',
        'View Dashboard',
        'View Employee Details',
        'View Attendance Details',
        'View Leave',
        'View Evaluation By Department',


        'Delete Evaluation',
        'Start Evaluation Rating',
        'Refresh Evaluation List',
        'View Employee Details',
        'View Attendance Details',
        'View Leave',

      ],
    ];

    foreach ($roles as $roleName => $rolePermissions) {
      $role = Role::firstOrCreate(['name' => $roleName]);
      $role->syncPermissions($rolePermissions);
    }

    $this->command->info('Permissions and roles seeded successfully!');
  }
}
