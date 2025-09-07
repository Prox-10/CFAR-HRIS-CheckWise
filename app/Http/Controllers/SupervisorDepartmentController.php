<?php

namespace App\Http\Controllers;

use App\Models\SupervisorDepartment;
use App\Models\HRDepartmentAssignment;
use App\Models\ManagerDepartmentAssignment;
use App\Models\User;
use App\Models\Employee;
use App\Models\EvaluationConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class SupervisorDepartmentController extends Controller
{
  /**
   * Display a listing of supervisor-department assignments
   */
  public function index()
  {
    $user = Auth::user();

    // Allow super admin and supervisors to access
    if (!$user->isSuperAdmin() && !$user->isSupervisor()) {
      return redirect()->route('evaluation.index')->withErrors(['error' => 'Access denied.']);
    }

    $supervisors = User::whereHas('roles', function ($query) {
      $query->where('name', 'Supervisor');
    })->with('supervisedDepartments')->get();

    // Get users with HR roles
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

    // Get users with Manager roles
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

    // Get HR assignments
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

    // Get Manager assignments
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

    // Get evaluation frequencies for all departments
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

    return Inertia::render('evaluation/supervisor-management', [
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

  /**
   * Store a new supervisor-department assignment
   */
  public function store(Request $request)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'user_id' => 'required|exists:users,id',
      'department' => 'required|string',
      'can_evaluate' => 'boolean',
    ]);

    // Check if user is a supervisor
    $supervisor = User::findOrFail($request->user_id);
    if (!$supervisor->isSupervisor()) {
      return back()->withErrors(['error' => 'Selected user must be a supervisor.']);
    }

    // Create or update assignment
    SupervisorDepartment::updateOrCreate(
      [
        'user_id' => $request->user_id,
        'department' => $request->department,
      ],
      [
        'can_evaluate' => $request->can_evaluate ?? true,
      ]
    );

    return back()->with('success', 'Supervisor assignment created successfully.');
  }

  /**
   * Update supervisor-department assignment
   */
  public function update(Request $request, SupervisorDepartment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'can_evaluate' => 'required|boolean',
    ]);

    $assignment->update([
      'can_evaluate' => $request->can_evaluate,
    ]);

    return back()->with('success', 'Supervisor assignment updated successfully.');
  }

  /**
   * Remove supervisor-department assignment
   */
  public function destroy(SupervisorDepartment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $assignment->delete();

    return back()->with('success', 'Supervisor assignment removed successfully.');
  }

  /**
   * Store a new HR Personnel-department assignment
   */
  public function storeHRAssignment(Request $request)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'user_id' => 'required|exists:users,id',
      'department' => 'required|string',
    ]);

    // Check if user has HR role
    $hrUser = User::findOrFail($request->user_id);
    if (!$hrUser->hasRole('HR') && !$hrUser->hasRole('HR Manager') && !$hrUser->hasRole('HR Personnel')) {
      return back()->withErrors(['error' => 'Selected user must have an HR role.']);
    }

    // Create assignment
    HRDepartmentAssignment::create([
      'user_id' => $request->user_id,
      'department' => $request->department,
    ]);

    return back()->with('success', 'HR Personnel assignment created successfully.');
  }

  /**
   * Remove HR Personnel-department assignment
   */
  public function destroyHRAssignment(HRDepartmentAssignment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $assignment->delete();

    return back()->with('success', 'HR Personnel assignment removed successfully.');
  }

  /**
   * Store a new Manager-department assignment
   */
  public function storeManagerAssignment(Request $request)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $request->validate([
      'user_id' => 'required|exists:users,id',
      'department' => 'required|string',
    ]);

    // Check if user has Manager role
    $managerUser = User::findOrFail($request->user_id);
    if (!$managerUser->hasRole('Manager') && !$managerUser->hasRole('Department Manager')) {
      return back()->withErrors(['error' => 'Selected user must have a Manager role.']);
    }

    // Create assignment
    ManagerDepartmentAssignment::create([
      'user_id' => $request->user_id,
      'department' => $request->department,
    ]);

    return back()->with('success', 'Manager assignment created successfully.');
  }

  /**
   * Remove Manager-department assignment
   */
  public function destroyManagerAssignment(ManagerDepartmentAssignment $assignment)
  {
    $user = Auth::user();

    if (!$user->isSuperAdmin()) {
      return back()->withErrors(['error' => 'Access denied.']);
    }

    $assignment->delete();

    return back()->with('success', 'Manager assignment removed successfully.');
  }
}
