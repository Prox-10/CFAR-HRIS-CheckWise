<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Position;

class DepartmentPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create departments
        $departments = [
            'Human Resources',
            'Finance',
            'IT',
            'Operations',
            'Production',
            'Admin',
            'Packing Plant',
            'Harvesting',
            'Coop Area',
            'P&D',
            'Engineering',
            'Utility',
            'Office Staff',
            'Packing Area',
            'Field Area',
        ];

        foreach ($departments as $departmentName) {
            Department::firstOrCreate(
                ['name' => $departmentName],
                [
                    'name' => $departmentName,
                    'description' => null,
                    'is_active' => true,
                ]
            );
        }

        // Create positions
        $positions = [
            'Harvester',
            'Accounting',
            'Manager',
            'Supervisor',
            'Driver',
            'Security',
            'Technician',
            'Support Staff',
            'Packer',
            'P&D',
            'Quality Control',
            'Logistics',
            'Warehouse Staff',
            'Maintenance',
            'Field Worker',
            'Cashier',
            'Finance(Payroll)',
        ];

        foreach ($positions as $positionName) {
            Position::firstOrCreate(
                ['name' => $positionName],
                [
                    'name' => $positionName,
                    'description' => null,
                    'is_active' => true,
                ]
            );
        }
    }
}
