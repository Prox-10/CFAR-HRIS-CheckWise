<?php

namespace App\Http\Controllers;

use App\Models\SupervisorDepartment;
use App\Models\HRDepartmentAssignment;
use App\Models\ManagerDepartmentAssignment;
use App\Models\User;
use App\Models\Employee;
use App\Models\EvaluationConfiguration;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminManagementController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $supervisors = User::whereHas('roles', function ($query) {
            $query->where('name', 'Supervisor');
        })->with('supervisedDepartments')->get();

        $hrPersonnel = User::whereHas('roles', function ($query) {
            $query->where('name', 'like', '%HR%')
                  ->orWhere('name', 'like', '%hr%');
        })->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
            ];
        });

        $managers = User::whereHas('roles', function ($query) {
            $query->where('name', 'like', '%Manager%')
                  ->orWhere('name', 'like', '%manager%');
        })->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
            ];
        });

        $departments = Employee::distinct()->pluck('department')->toArray();

        $assignments = SupervisorDepartment::with('user')->get();

        $hrAssignments = HRDepartmentAssignment::with('user')->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'user_id' => $assignment->user_id,
                'department' => $assignment->department,
                'user' => [
                    'id' => $assignment->user->id,
                    'firstname' => $assignment->user->firstname,
                    'lastname' => $assignment->user->lastname,
                    'email' => $assignment->user->email,
                ],
            ];
        });

        $managerAssignments = ManagerDepartmentAssignment::with('user')->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'user_id' => $assignment->user_id,
                'department' => $assignment->department,
                'user' => [
                    'id' => $assignment->user->id,
                    'firstname' => $assignment->user->firstname,
                    'lastname' => $assignment->user->lastname,
                    'email' => $assignment->user->email,
                ],
            ];
        });

        $frequencies = [];
        foreach ($departments as $department) {
            $config = EvaluationConfiguration::where('department', $department)->first();
            $employeeCount = Employee::where('department', $department)->count();

            $frequencies[] = [
                'department' => $department,
                'evaluation_frequency' => $config ? $config->evaluation_frequency : 'annual',
                'employee_count' => $employeeCount,
            ];
        }

        return Inertia::render('admin-management/index', [
            'supervisors' => $supervisors,
            'hr_personnel' => $hrPersonnel,
            'managers' => $managers,
            'departments' => $departments,
            'assignments' => $assignments,
            'hr_assignments' => $hrAssignments,
            'manager_assignments' => $managerAssignments,
            'frequencies' => $frequencies,
            'user_permissions' => [
                'is_super_admin' => $user->isSuperAdmin(),
                'is_supervisor' => $user->isSupervisor(),
                'can_evaluate' => $user->canEvaluate(),
            ],
        ]);
    }
}


