<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\EvaluationConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class EvaluationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        Log::info('Evaluation index accessed by user:', [
            'user_id' => $user->id,
            'user_name' => $user->firstname . ' ' . $user->lastname,
            'is_super_admin' => $user->isSuperAdmin(),
            'is_supervisor' => $user->isSupervisor(),
            'can_evaluate' => $user->canEvaluate(),
            'evaluable_departments' => $user->getEvaluableDepartments(),
        ]);

        // Get employees based on user role
        $employees = $this->getEmployeesForUser($user);

        $employeeList = $employees->map(function ($employee) {
            $latestEval = $employee->evaluations->first();
            return [
                'id' => $employee->id,
                'employee_id' => $employee->id,
                'ratings' => $latestEval ? $latestEval->ratings : '',
                'rating_date' => $latestEval ? $latestEval->rating_date : '',
                'work_quality' => $latestEval ? $latestEval->work_quality : '',
                'safety_compliance' => $latestEval ? $latestEval->safety_compliance : '',
                'punctuality' => $latestEval ? $latestEval->punctuality : '',
                'teamwork' => $latestEval ? $latestEval->teamwork : '',
                'organization' => $latestEval ? $latestEval->organization : '',
                'equipment_handling' => $latestEval ? $latestEval->equipment_handling : '',
                'comment' => $latestEval ? $latestEval->comment : '',
                'period' => $latestEval ? $latestEval->period : '',
                'period_label' => $latestEval ? $latestEval->period_label : '',
                'employee_name' => $employee->employee_name,
                'picture' => $employee->picture,
                'department' => $employee->department,
                'position' => $employee->position,
                'employeeid' => $employee->employeeid,
                'evaluation_frequency' => EvaluationConfiguration::getFrequencyForDepartment($employee->department),
            ];
        });

        // Debug: Log the employee list details
        Log::info('EmployeeList for Evaluation Table:', [
            'total_count' => $employeeList->count(),
            'departments' => $employeeList->pluck('department')->unique()->toArray(),
            'sample_employees' => $employeeList->take(5)->toArray()
        ]);

        return Inertia::render('evaluation/index', [
            'employees_all' => $employeeList,
            'user_permissions' => [
                'can_evaluate' => $user->canEvaluate(),
                'is_super_admin' => $user->isSuperAdmin(),
                'is_supervisor' => $user->isSupervisor(),
                'evaluable_departments' => $user->getEvaluableDepartments(),
            ],
        ]);
    }

    /**
     * Get employees based on user role and permissions
     */
    private function getEmployeesForUser($user)
    {
        $query = Employee::with(['evaluations' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        if ($user->isSuperAdmin()) {
            // Super admin can see all employees
            Log::info('User is Super Admin - showing all employees');
            return $query->orderBy('employee_name')->get();
        } elseif ($user->isSupervisor()) {
            // Supervisor can only see employees in departments they supervise
            $evaluableDepartments = $user->getEvaluableDepartments();
            Log::info('Supervisor evaluable departments:', $evaluableDepartments);

            if (empty($evaluableDepartments)) {
                Log::warning('No departments assigned to supervisor');
                return collect(); // No departments assigned
            }

            $employees = $query->whereIn('department', $evaluableDepartments)
                ->orderBy('employee_name')
                ->get();

            Log::info('Supervisor employees found:', [
                'count' => $employees->count(),
                'departments' => $evaluableDepartments,
                'employees' => $employees->pluck('employee_name', 'department')->toArray()
            ]);

            return $employees;
        } else {
            // Other roles (Manager, HR) can only view, not evaluate
            Log::info('User is other role - showing all employees');
            return $query->orderBy('employee_name')->get();
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('evaluations.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Check if user can evaluate
        if (!$user->canEvaluate()) {
            return back()->withErrors(['evaluation' => 'You do not have permission to create evaluations.']);
        }

        // Validate input
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'work_quality' => 'required|integer|min:1|max:10',
            'safety_compliance' => 'required|integer|min:1|max:10',
            'equipment_handling' => 'required|integer|min:1|max:10',
            'teamwork' => 'required|integer|min:1|max:10',
            'punctuality' => 'required|integer|min:1|max:10',
            'organization' => 'required|integer|min:1|max:10',
            'comment' => 'nullable|string',
        ]);

        // Get the employee to check department permissions
        $employee = Employee::findOrFail($validated['employee_id']);

        // Check if user can evaluate this employee
        if (!$user->isSuperAdmin() && !$user->canEvaluateDepartment($employee->department)) {
            return back()->withErrors(['evaluation' => 'You do not have permission to evaluate employees in this department.']);
        }

        // Check if employee can be evaluated for current period
        if (!Evaluation::canEvaluateEmployee($validated['employee_id'], $employee->department)) {
            $frequency = EvaluationConfiguration::getFrequencyForDepartment($employee->department);
            $periodLabel = $frequency === 'annual' ? 'this year' : 'this period';
            return back()->withErrors(['evaluation' => "This employee has already been evaluated for {$periodLabel}."]);
        }

        // Calculate current period and year
        $now = now();
        $currentPeriod = Evaluation::calculatePeriod($now);
        $currentYear = $now->year;

        // Calculate average
        $criteria = [
            $validated['work_quality'],
            $validated['safety_compliance'],
            $validated['equipment_handling'],
            $validated['teamwork'],
            $validated['punctuality'],
            $validated['organization'],
        ];
        $average = number_format(array_sum($criteria) / count($criteria), 1);

        // Save evaluation
        $evaluation = Evaluation::create([
            'employee_id' => $validated['employee_id'],
            'work_quality' => $validated['work_quality'],
            'safety_compliance' => $validated['safety_compliance'],
            'equipment_handling' => $validated['equipment_handling'],
            'teamwork' => $validated['teamwork'],
            'punctuality' => $validated['punctuality'],
            'organization' => $validated['organization'],
            'ratings' => $average, // calculated here, not from request
            'comment' => $validated['comment'] ?? '',
            'rating_date' => $now->toDateString(),
            'period' => $currentPeriod,
            'year' => $currentYear,
        ]);
        return redirect()->route('evaluation.index')->with('success', 'Evaluation created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Evaluation $evaluation)
    {
        return view('evaluations.show', compact('evaluation'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Evaluation $evaluation)
    {
        return view('evaluations.edit', compact('evaluation'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Evaluation $evaluation)
    {
        $evaluation->update($request->all());
        return redirect()->route('evaluation.index')->with('success', 'Evaluation updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();
        return redirect()->route('evaluation.index')->with('success', 'Evaluation deleted successfully');
    }
}
