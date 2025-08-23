<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\EvaluationConfiguration;
use App\Models\EvaluationAttendance;
use App\Models\EvaluationAttitudes;
use App\Models\EvaluationWorkAttitude;
use App\Models\EvaluationWorkFunction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
            $latestEval = $employee->evaluations()->with(['attendance', 'attitudes', 'workAttitude', 'workFunctions'])->first();
            $frequency = EvaluationConfiguration::getFrequencyForDepartment($employee->department);

            // Debug logging for frequency lookup
            Log::info('Employee frequency lookup:', [
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'found_frequency' => $frequency,
                'frequency_type' => gettype($frequency),
                'frequency_length' => is_string($frequency) ? strlen($frequency) : 'N/A',
            ]);

            $employeeData = [
                'id' => $employee->id,
                'employee_id' => $employee->id,
                'ratings' => $latestEval ? $latestEval->overall_rating : '',
                'rating_date' => $latestEval ? $latestEval->rating_date : '',
                'work_quality' => $latestEval ? ($latestEval->workFunctions ? $latestEval->workFunctions->avg('work_quality') : '') : '',
                'safety_compliance' => $latestEval ? ($latestEval->workAttitude ? $latestEval->workAttitude->responsible : '') : '',
                'punctuality' => $latestEval ? ($latestEval->attendance ? $latestEval->attendance->rating : '') : '',
                'teamwork' => $latestEval ? ($latestEval->workAttitude ? $latestEval->workAttitude->cooperation : '') : '',
                'organization' => $latestEval ? ($latestEval->workAttitude ? $latestEval->workAttitude->initiative : '') : '',
                'equipment_handling' => $latestEval ? ($latestEval->workAttitude ? $latestEval->workAttitude->job_knowledge : '') : '',
                'comment' => $latestEval ? $latestEval->observations : '',
                'period' => $latestEval ? $latestEval->evaluation_period : '',
                'period_label' => $latestEval ? $latestEval->period_label : '',
                'employee_name' => $employee->employee_name,
                'picture' => $employee->picture,
                'department' => $employee->department,
                'position' => $employee->position,
                'employeeid' => $employee->employeeid,
                'evaluation_frequency' => $frequency,
            ];

            // Debug: Log the final employee data
            Log::info('Final employee data for ' . $employee->employee_name . ':', [
                'department' => $employeeData['department'],
                'evaluation_frequency' => $employeeData['evaluation_frequency'],
                'has_frequency' => isset($employeeData['evaluation_frequency']),
            ]);

            return $employeeData;
        });

        // Debug: Log the employee list details
        Log::info('EmployeeList for Evaluation Table:', [
            'total_count' => $employeeList->count(),
            'departments' => $employeeList->pluck('department')->unique()->toArray(),
            'sample_employees' => $employeeList->take(5)->toArray()
        ]);

        // Debug: Log all evaluation configurations
        $allConfigs = \App\Models\EvaluationConfiguration::all();
        Log::info('All evaluation configurations:', $allConfigs->toArray());

        // Debug: Log unique departments from employees vs configurations
        $employeeDepartments = $employeeList->pluck('department')->unique()->toArray();
        $configDepartments = $allConfigs->pluck('department')->toArray();
        Log::info('Department comparison:', [
            'employee_departments' => $employeeDepartments,
            'config_departments' => $configDepartments,
            'missing_departments' => array_diff($employeeDepartments, $configDepartments)
        ]);

        // Debug: Log what's being sent to frontend
        Log::info('Data being sent to frontend:', [
            'total_employees' => $employeeList->count(),
            'sample_employee' => $employeeList->first(),
            'all_employees_with_frequency' => $employeeList->pluck('evaluation_frequency', 'employee_name')->toArray(),
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

        // Check evaluation frequency rules (Super Admin can bypass)
        if (!$user->isSuperAdmin()) {
            $frequency = EvaluationConfiguration::getFrequencyForDepartment($employee->department);
            $now = now();
            $currentPeriod = Evaluation::calculatePeriod($now);
            $currentYear = $now->year;

            if ($frequency === 'annual') {
                // Annual evaluation: Check if already evaluated this year
                $existingEvaluation = Evaluation::where('employee_id', $validated['employee_id'])
                    ->where('evaluation_year', $currentYear)
                    ->first();

                if ($existingEvaluation) {
                    $lastEvalDate = $existingEvaluation->rating_date;
                    return back()->withErrors([
                        'evaluation' => "This employee has already been evaluated for {$currentYear}. Last evaluation date: {$lastEvalDate}. Annual departments can only be evaluated once per year.",
                        'duplicate_evaluation' => true,
                        'existing_evaluation_id' => $existingEvaluation->id
                    ]);
                }
            } else {
                // Semi-annual evaluation: Check if already evaluated this period
                $existingEvaluation = Evaluation::where('employee_id', $validated['employee_id'])
                    ->where('evaluation_period', $currentPeriod)
                    ->where('evaluation_year', $currentYear)
                    ->first();

                if ($existingEvaluation) {
                    $periodLabel = $currentPeriod === 1 ? 'January to June' : 'July to December';
                    $lastEvalDate = $existingEvaluation->rating_date;
                    return back()->withErrors([
                        'evaluation' => "This employee has already been evaluated for {$periodLabel} {$currentYear}. Last evaluation date: {$lastEvalDate}. Semi-annual departments can only be evaluated once per period.",
                        'duplicate_evaluation' => true,
                        'existing_evaluation_id' => $existingEvaluation->id
                    ]);
                }
            }
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
     * Remove the specified resource.
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();
        return redirect()->route('evaluation.index')->with('success', 'Evaluation deleted successfully');
    }

    public function departmentEvaluation()
    {
        $user = Auth::user();

        // Get all departments from the global departments list
        $departments = ['Monthly', 'Packing Plant', 'Harvesting', 'Pest & Decease', 'Coop Area', 'Engineering', 'Admin', 'Utility'];

        // Get employees based on user role and permissions
        $employees = $this->getEmployeesForUser($user);

        // Get evaluation configurations for departments - convert to array format for frontend
        $evaluationConfigs = EvaluationConfiguration::all()->map(function ($config) {
            return [
                'department' => $config->department,
                'evaluation_frequency' => $config->evaluation_frequency,
            ];
        })->toArray();

        return Inertia::render('evaluation/department-evaluation', [
            'departments' => $departments,
            'employees_all' => $employees,
            'evaluation_configs' => $evaluationConfigs,
            'user_permissions' => [
                'can_evaluate' => $user->canEvaluate(),
                'is_super_admin' => $user->isSuperAdmin(),
                'is_supervisor' => $user->isSupervisor(),
                'evaluable_departments' => $user->getEvaluableDepartments(),
            ],
        ]);
    }

    /**
     * Store a department evaluation
     */
    public function storeDepartmentEvaluation(Request $request)
    {
        $user = Auth::user();

        // Check if user can evaluate
        if (!$user->canEvaluate()) {
            return back()->withErrors(['evaluation' => 'You do not have permission to create evaluations.']);
        }

        // Validate input
        $validated = $request->validate([
            'department' => 'required|string',
            'employee_id' => 'required|exists:employees,id',
            'attendance.daysLate' => 'required|integer|min:0',
            'attendance.daysAbsent' => 'required|integer|min:0',
            'attendance.rating' => 'required|numeric|min:0|max:10',
            'attendance.remarks' => 'nullable|string',
            'attitudeSupervisor.rating' => 'required|integer|min:0|max:10',
            'attitudeSupervisor.remarks' => 'nullable|string',
            'attitudeCoworker.rating' => 'required|integer|min:0|max:10',
            'attitudeCoworker.remarks' => 'nullable|string',
            'workAttitude.responsible' => 'required|integer|min:0|max:10',
            'workAttitude.jobKnowledge' => 'required|integer|min:0|max:10',
            'workAttitude.cooperation' => 'required|integer|min:0|max:10',
            'workAttitude.initiative' => 'required|integer|min:0|max:10',
            'workAttitude.dependability' => 'required|integer|min:0|max:10',
            'workAttitude.remarks' => 'nullable|string',
            'workFunctions' => 'required|array',
            'workFunctions.*.workQuality' => 'required|integer|min:0|max:10',
            'workFunctions.*.workEfficiency' => 'required|integer|min:0|max:10',
            'observations' => 'nullable|string',
            'evaluator' => 'required|string',
        ]);

        // Get the employee to check department permissions
        $employee = Employee::findOrFail($validated['employee_id']);

        // Check if user can evaluate this employee
        if (!$user->isSuperAdmin() && !$user->canEvaluateDepartment($employee->department)) {
            return back()->withErrors(['evaluation' => 'You do not have permission to evaluate employees in this department.']);
        }

        // Check evaluation frequency rules (Super Admin can bypass)
        if (!$user->isSuperAdmin()) {
            $frequency = EvaluationConfiguration::getFrequencyForDepartment($employee->department);
            $now = now();
            $currentPeriod = Evaluation::calculatePeriod($now);
            $currentYear = $now->year;

            Log::info('Checking evaluation frequency rules in storeDepartmentEvaluation:', [
                'employee_id' => $validated['employee_id'],
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'frequency' => $frequency,
                'current_period' => $currentPeriod,
                'current_year' => $currentYear,
                'user_id' => $user->id,
                'user_role' => $user->hasRole('Super Admin') ? 'Super Admin' : 'Supervisor'
            ]);

            if ($frequency === 'annual') {
                // Annual evaluation: Check if already evaluated this year
                $existingEvaluation = Evaluation::where('employee_id', $validated['employee_id'])
                    ->where('evaluation_year', $currentYear)
                    ->first();

                if ($existingEvaluation) {
                    $lastEvalDate = $existingEvaluation->rating_date;
                    Log::warning('Evaluation blocked - Annual frequency rule violated in storeDepartmentEvaluation:', [
                        'employee_id' => $validated['employee_id'],
                        'employee_name' => $employee->employee_name,
                        'department' => $employee->department,
                        'last_evaluation_date' => $lastEvalDate,
                        'current_year' => $currentYear
                    ]);
                    return back()->withErrors([
                        'evaluation' => "This employee has already been evaluated for {$currentYear}. Last evaluation date: {$lastEvalDate}. Annual departments can only be evaluated once per year."
                    ]);
                }
            } else {
                // Semi-annual evaluation: Check if already evaluated this period
                $existingEvaluation = Evaluation::where('employee_id', $validated['employee_id'])
                    ->where('evaluation_period', $currentPeriod)
                    ->where('evaluation_year', $currentYear)
                    ->first();

                if ($existingEvaluation) {
                    $periodLabel = $currentPeriod === 1 ? 'January to June' : 'July to December';
                    $lastEvalDate = $existingEvaluation->rating_date;
                    Log::warning('Evaluation blocked - Semi-annual frequency rule violated in storeDepartmentEvaluation:', [
                        'employee_id' => $validated['employee_id'],
                        'employee_name' => $employee->employee_name,
                        'department' => $employee->department,
                        'last_evaluation_date' => $lastEvalDate,
                        'current_period' => $currentPeriod,
                        'period_label' => $periodLabel,
                        'current_year' => $currentYear
                    ]);
                    return back()->withErrors([
                        'evaluation' => "This employee has already been evaluated for {$periodLabel} {$currentYear}. Last evaluation date: {$lastEvalDate}. Semi-annual departments can only be evaluated once per period."
                    ]);
                }
            }

            Log::info('Evaluation frequency validation passed in storeDepartmentEvaluation:', [
                'employee_id' => $validated['employee_id'],
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'frequency' => $frequency
            ]);
        } else {
            Log::info('Super Admin bypassing frequency rules in storeDepartmentEvaluation:', [
                'employee_id' => $validated['employee_id'],
                'employee_name' => $employee->employee_name,
                'department' => $employee->department,
                'user_id' => $user->id
            ]);
        }

        // Calculate work functions average
        $workFunctionScores = [];
        foreach ($validated['workFunctions'] as $function => $scores) {
            if (isset($scores['workQuality']) && isset($scores['workEfficiency'])) {
                $workFunctionScores[] = ($scores['workQuality'] + $scores['workEfficiency']) / 2;
            }
        }
        $workFunctionAvg = !empty($workFunctionScores) ? array_sum($workFunctionScores) / count($workFunctionScores) : 0;

        // Calculate work attitude average
        $workAttitudeScores = [
            $validated['workAttitude']['responsible'],
            $validated['workAttitude']['jobKnowledge'],
            $validated['workAttitude']['cooperation'],
            $validated['workAttitude']['initiative'],
            $validated['workAttitude']['dependability'],
        ];
        $workAttitudeAvg = array_sum($workAttitudeScores) / count($workAttitudeScores);

        // Calculate total rating
        $totalRating = (
            $validated['attendance']['rating'] +
            $validated['attitudeSupervisor']['rating'] +
            $validated['attitudeCoworker']['rating'] +
            $workAttitudeAvg +
            $workFunctionAvg
        ) / 5;

        // Calculate current period and year
        $now = now();
        $currentPeriod = Evaluation::calculatePeriod($now);
        $currentYear = $now->year;

        try {
            DB::beginTransaction();

            // Log the data being processed
            Log::info('Processing department evaluation:', [
                'validated_data' => $validated,
                'calculated_ratings' => [
                    'work_function_avg' => $workFunctionAvg,
                    'work_attitude_avg' => $workAttitudeAvg,
                    'total_rating' => $totalRating,
                ],
                'current_period' => $currentPeriod,
                'current_year' => $currentYear,
            ]);

            // Get the actual evaluation frequency for this department
            $departmentFrequency = EvaluationConfiguration::getFrequencyForDepartment($validated['department']);

            Log::info('Using department frequency for evaluation:', [
                'department' => $validated['department'],
                'frequency' => $departmentFrequency,
                'employee_id' => $validated['employee_id']
            ]);

            // Save main evaluation
            $evaluation = Evaluation::create([
                'employee_id' => $validated['employee_id'],
                'department' => $validated['department'],
                'evaluation_frequency' => $departmentFrequency, // Use actual department frequency
                'evaluator' => $validated['evaluator'],
                'observations' => $validated['observations'] ?? '',
                'total_rating' => (float) number_format($totalRating, 1),
                'evaluation_year' => $currentYear,
                'evaluation_period' => $currentPeriod,
                'rating_date' => $now->toDateString(),
            ]);

            Log::info('Main evaluation created:', ['evaluation_id' => $evaluation->id]);

            // Save attendance data
            $attendance = EvaluationAttendance::create([
                'evaluation_id' => $evaluation->id,
                'days_late' => $validated['attendance']['daysLate'],
                'days_absent' => $validated['attendance']['daysAbsent'],
                'rating' => $validated['attendance']['rating'],
                'remarks' => $validated['attendance']['remarks'] ?? '',
            ]);

            Log::info('Attendance data created:', ['attendance_id' => $attendance->id]);

            // Save attitudes data
            $attitudes = EvaluationAttitudes::create([
                'evaluation_id' => $evaluation->id,
                'supervisor_rating' => $validated['attitudeSupervisor']['rating'],
                'supervisor_remarks' => $validated['attitudeSupervisor']['remarks'] ?? '',
                'coworker_rating' => $validated['attitudeCoworker']['rating'],
                'coworker_remarks' => $validated['attitudeCoworker']['remarks'] ?? '',
            ]);

            Log::info('Attitudes data created:', ['attitudes_id' => $attitudes->id]);

            // Save work attitude data
            $workAttitude = EvaluationWorkAttitude::create([
                'evaluation_id' => $evaluation->id,
                'responsible' => $validated['workAttitude']['responsible'],
                'job_knowledge' => $validated['workAttitude']['jobKnowledge'],
                'cooperation' => $validated['workAttitude']['cooperation'],
                'initiative' => $validated['workAttitude']['initiative'],
                'dependability' => $validated['workAttitude']['dependability'],
                'remarks' => $validated['workAttitude']['remarks'] ?? '',
            ]);

            Log::info('Work attitude data created:', ['work_attitude_id' => $workAttitude->id]);

            // Save work functions data
            $workFunctionCount = 0;
            foreach ($validated['workFunctions'] as $functionName => $scores) {
                if (is_array($scores) && isset($scores['workQuality']) && isset($scores['workEfficiency'])) {
                    $workFunction = EvaluationWorkFunction::create([
                        'evaluation_id' => $evaluation->id,
                        'function_name' => $functionName,
                        'work_quality' => $scores['workQuality'],
                        'work_efficiency' => $scores['workEfficiency'],
                    ]);
                    $workFunctionCount++;
                    Log::info('Work function created:', [
                        'function_name' => $functionName,
                        'work_function_id' => $workFunction->id
                    ]);
                } else {
                    Log::warning('Invalid work function data:', [
                        'function_name' => $functionName,
                        'scores' => $scores
                    ]);
                }
            }

            Log::info('Work functions created:', ['count' => $workFunctionCount]);

            DB::commit();

            Log::info('Department evaluation completed successfully', [
                'evaluation_id' => $evaluation->id,
                'employee_id' => $validated['employee_id'],
                'department' => $validated['department']
            ]);

            return redirect()->route('evaluation.department-evaluation')->with('success', 'Department evaluation submitted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving department evaluation:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return back()->withErrors(['evaluation' => 'An error occurred while saving the evaluation. Please try again.']);
        }
    }

    /**
     * Check if employee has existing evaluation for current period
     */
    public function checkExistingEvaluation($employeeId, $department)
    {
        $frequency = EvaluationConfiguration::getFrequencyForDepartment($department);
        $now = now();
        $currentPeriod = Evaluation::calculatePeriod($now);
        $currentYear = $now->year;

        Log::info('Checking existing evaluation:', [
            'employee_id' => $employeeId,
            'department' => $department,
            'frequency' => $frequency,
            'current_period' => $currentPeriod,
            'current_year' => $currentYear,
        ]);

        if ($frequency === 'annual') {
            $existingEvaluation = Evaluation::where('employee_id', $employeeId)
                ->where('evaluation_year', $currentYear)
                ->with(['attendance', 'attitudes', 'workAttitude', 'workFunctions'])
                ->first();
        } else {
            $existingEvaluation = Evaluation::where('employee_id', $employeeId)
                ->where('evaluation_period', $currentPeriod)
                ->where('evaluation_year', $currentYear)
                ->with(['attendance', 'attitudes', 'workAttitude', 'workFunctions'])
                ->first();
        }

        if ($existingEvaluation) {
            // Debug: Log the loaded relationships
            Log::info('Existing evaluation found:', [
                'evaluation_id' => $existingEvaluation->id,
                'has_attendance' => $existingEvaluation->attendance ? 'Yes' : 'No',
                'has_attitudes' => $existingEvaluation->attitudes ? 'Yes' : 'No',
                'has_workAttitude' => $existingEvaluation->workAttitude ? 'Yes' : 'No',
                // For hasMany relations, ensure we check if the collection is not empty
                'has_workFunctions' => ($existingEvaluation->relationLoaded('workFunctions') && $existingEvaluation->workFunctions->isNotEmpty()) ? 'Yes' : 'No',
                'workFunctions_count' => $existingEvaluation->relationLoaded('workFunctions') ? $existingEvaluation->workFunctions->count() : 0,
            ]);

            // Debug: Log work functions data if it exists
            if ($existingEvaluation->relationLoaded('workFunctions') && $existingEvaluation->workFunctions->isNotEmpty()) {
                Log::info('Work functions data:', $existingEvaluation->workFunctions->toArray());
            }

            // Debug: Log work attitude data if it exists
            if ($existingEvaluation->workAttitude) {
                Log::info('Work attitude data:', $existingEvaluation->workAttitude->toArray());
            }

            $periodLabel = $frequency === 'annual' ? $currentYear : ($currentPeriod === 1 ? 'January to June' : 'July to December') . ' ' . $currentYear;

            // Convert the evaluation to an array to ensure proper JSON serialization
            $evaluationArray = $existingEvaluation->toArray();

            // Manually add the relationships as arrays
            if ($existingEvaluation->attendance) {
                $evaluationArray['attendance'] = $existingEvaluation->attendance->toArray();
            }
            if ($existingEvaluation->attitudes) {
                $evaluationArray['attitudes'] = $existingEvaluation->attitudes->toArray();
            }
            if ($existingEvaluation->workAttitude) {
                $evaluationArray['workAttitude'] = $existingEvaluation->workAttitude->toArray();
            }
            // Only include workFunctions if there are any
            if ($existingEvaluation->relationLoaded('workFunctions') && $existingEvaluation->workFunctions->isNotEmpty()) {
                $evaluationArray['workFunctions'] = $existingEvaluation->workFunctions->toArray();
            }

            // Debug: Log the final response data
            $responseData = [
                'exists' => true,
                'evaluation' => $evaluationArray,
                'period_label' => $periodLabel,
                'frequency' => $frequency,
                'message' => "Employee already evaluated for {$periodLabel}"
            ];

            Log::info('Response data being sent to frontend:', [
                'evaluation_id' => $existingEvaluation->id,
                'has_attendance_in_array' => isset($evaluationArray['attendance']),
                'has_attitudes_in_array' => isset($evaluationArray['attitudes']),
                'has_workAttitude_in_array' => isset($evaluationArray['workAttitude']),
                // Report presence based on actual count
                'has_workFunctions_in_array' => isset($evaluationArray['workFunctions']) && count($evaluationArray['workFunctions']) > 0,
                'workFunctions_count_in_array' => isset($evaluationArray['workFunctions']) ? count($evaluationArray['workFunctions']) : 0,
            ]);

            return $responseData;
        }

        Log::info('No existing evaluation found');
        return ['exists' => false];
    }

    /**
     * Get evaluation frequencies for all departments
     */
    public function getFrequencies()
    {
        try {
            $departments = ['Monthly', 'Packing Plant', 'Harvesting', 'Pest & Decease', 'Coop Area', 'Engineering', 'Admin', 'Utility'];
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

            return response()->json($frequencies);
        } catch (\Exception $e) {
            Log::error('Failed to fetch evaluation frequencies: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch frequencies'], 500);
        }
    }

    /**
     * Update evaluation frequency for a department
     */
    public function updateFrequency(Request $request, $department)
    {
        $user = Auth::user();

        // Check if user is super admin or can evaluate
        if (!$user->isSuperAdmin() && !$user->canEvaluate()) {
            return back()->withErrors(['evaluation' => 'You do not have permission to update evaluation frequencies.']);
        }

        try {
            // Validate request
            $validated = $request->validate([
                'evaluation_frequency' => 'required|in:semi_annual,annual',
            ]);

            // Update or create configuration
            EvaluationConfiguration::updateOrCreate(
                ['department' => $department],
                ['evaluation_frequency' => $validated['evaluation_frequency']]
            );

            Log::info('Evaluation frequency updated', [
                'department' => $department,
                'frequency' => $validated['evaluation_frequency'],
                'updated_by' => $user->id,
            ]);

            return back()->with('success', "Evaluation frequency for {$department} updated to {$validated['evaluation_frequency']}");
        } catch (\Exception $e) {
            Log::error('Failed to update evaluation frequency: ' . $e->getMessage());
            return back()->withErrors(['evaluation' => 'Failed to update frequency']);
        }
    }

    public function evaluationSettings(){
        return Inertia::render('evaluation/evaluation-settings');
    }
}
