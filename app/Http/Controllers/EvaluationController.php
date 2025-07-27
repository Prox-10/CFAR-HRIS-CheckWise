<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;

class EvaluationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch all employees with their evaluations (latest first)
        $employees = Employee::with(['evaluations' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('employee_name')->get();

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
                'employee_name' => $employee->employee_name,
                'picture' => $employee->picture,
                'department' => $employee->department,
                'position' => $employee->position,
                'employeeid' => $employee->employeeid,
            ];
        });

        // Debug: Log the first few employees and their ratings
        Log::info('EmployeeList for Evaluation Table:', $employeeList->take(5)->toArray());

        return Inertia::render('evaluation/index', [
            'employees_all' => $employeeList,
        ]);
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

        // Determine current quarter and year
        $now = now();
        $quarter = ceil($now->month / 3);
        $year = $now->year;

        // Enforce only one evaluation per employee per quarter per year
        $exists = Evaluation::where('employee_id', $validated['employee_id'])
            ->where('quarter', $quarter)
            ->where('year', $year)
            ->exists();
        if ($exists) {
            return back()->withErrors(['evaluation' => 'This employee has already been evaluated for this quarter.']);
        }

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
            'quarter' => $quarter,
            'year' => $year,
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
