<?php

namespace App\Http\Controllers;

use App\Models\SupervisorDepartment;
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

    $departments = Employee::distinct()->pluck('department')->toArray();

    $assignments = SupervisorDepartment::with('user')->get();

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
      'departments' => $departments,
      'assignments' => $assignments,
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
}
