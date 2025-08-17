<?php

namespace App\Http\Controllers;

use App\Models\ResumeToWork;
use App\Models\Employee;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class ResumeToWorkController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    $user = Auth::user();
    $isSupervisor = $user->isSupervisor();
    $isSuperAdmin = $user->isSuperAdmin();

    // Get user's supervised departments if supervisor
    $supervisedDepartments = $isSupervisor ? $user->getEvaluableDepartments() : [];

    // Base query for resume to work requests
    $resumeQuery = ResumeToWork::with('employee', 'processedBy');

    // Filter based on user role
    if ($isSupervisor && !empty($supervisedDepartments)) {
      $resumeQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
        $query->whereIn('department', $supervisedDepartments);
      });
    }

    $resumeRequests = $resumeQuery->orderBy('created_at', 'desc')->get();

    $resumeList = $resumeRequests->transform(fn($resume) => [
      'id' => $resume->id,
      'employee_name' => $resume->employee ? $resume->employee->employee_name : null,
      'employee_id' => $resume->employee ? $resume->employee->employeeid : null,
      'department' => $resume->employee ? $resume->employee->department : null,
      'position' => $resume->employee ? $resume->employee->position : null,
      'return_date' => $resume->return_date->format('Y-m-d'),
      'previous_absence_reference' => $resume->previous_absence_reference,
      'comments' => $resume->comments,
      'status' => $resume->status,
      'processed_by' => $resume->processedBy ? $resume->processedBy->name : null,
      'processed_at' => $resume->processed_at ? $resume->processed_at->format('Y-m-d H:i') : null,
      'supervisor_notified' => $resume->supervisor_notified,
      'supervisor_notified_at' => $resume->supervisor_notified_at ? $resume->supervisor_notified_at->format('Y-m-d H:i') : null,
      'created_at' => $resume->created_at->format('Y-m-d H:i'),
    ]);

    // Get employees for the form
    $employeeQuery = Employee::orderBy('employee_name');
    
    // Filter employees based on user role
    if ($isSupervisor && !empty($supervisedDepartments)) {
        $employeeQuery->whereIn('department', $supervisedDepartments);
    }
    
    $employees = $employeeQuery->get()->map(fn($employee) => [
        'id' => $employee->id,
        'employee_name' => $employee->employee_name,
        'employeeid' => $employee->employeeid,
        'department' => $employee->department,
        'position' => $employee->position,
    ]);

    return Inertia::render('resume-to-work/index', [
      'resumeRequests' => $resumeList,
      'employees' => $employees, // Add this line
      'userRole' => [
        'is_supervisor' => $isSupervisor,
        'is_super_admin' => $isSuperAdmin,
        'supervised_departments' => $supervisedDepartments,
      ],
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    try {
      $request->validate([
        'employee_id' => 'required|exists:employees,id',
        'return_date' => 'required|date',
        'previous_absence_reference' => 'nullable|string',
        'comments' => 'nullable|string',
      ]);

      $resumeToWork = ResumeToWork::create([
        'employee_id' => $request->employee_id,
        'return_date' => $request->return_date,
        'previous_absence_reference' => $request->previous_absence_reference,
        'comments' => $request->comments,
        'status' => 'pending',
      ]);

      // Create notification for HR Admin
      $employee = Employee::find($request->employee_id);
      Notification::create([
        'type' => 'resume_to_work',
        'data' => [
          'resume_id' => $resumeToWork->id,
          'employee_name' => $employee ? $employee->employee_name : null,
          'return_date' => $request->return_date,
        ],
      ]);

      return redirect()->back()->with('success', 'Resume to work form submitted successfully!');
    } catch (Exception $e) {
      Log::error('Resume to work creation failed: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Failed to submit resume to work form. Please try again.');
    }
  }

  /**
   * Process resume to work form (HR Admin action)
   */
  public function process(Request $request, ResumeToWork $resumeToWork)
  {
    try {
      $user = Auth::user();

                  // Only HR Admin or Super Admin can process
            if (!$user->isSuperAdmin() && !$user->hasRole('HR Admin')) {
                return redirect()->back()->with('error', 'Unauthorized action.');
            }

      $resumeToWork->markAsProcessed($user->id);

      // Create notification for supervisor
      $employee = $resumeToWork->employee;
      if ($employee) {
        Notification::create([
          'type' => 'employee_returned',
          'data' => [
            'employee_name' => $employee->employee_name,
            'employee_id' => $employee->employeeid,
            'department' => $employee->department,
            'return_date' => $resumeToWork->return_date->format('Y-m-d'),
          ],
        ]);
      }

      return redirect()->back()->with('success', 'Resume to work form processed successfully! Supervisor has been notified.');
    } catch (Exception $e) {
      Log::error('Resume to work processing failed: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Failed to process resume to work form. Please try again.');
    }
  }

  /**
   * Mark supervisor as notified
   */
  public function markSupervisorNotified(ResumeToWork $resumeToWork)
  {
    try {
      $resumeToWork->markSupervisorNotified();
      return response()->json(['success' => true]);
    } catch (Exception $e) {
      Log::error('Mark supervisor notified failed: ' . $e->getMessage());
      return response()->json(['success' => false], 500);
    }
  }
}
