<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class AbsenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch absences with employee relationship
        $absences = Absence::with('employee', 'approver')
            ->orderBy('submitted_at', 'desc')
            ->get();

        $absenceList = $absences->transform(fn($absence) => [
            'id' => $absence->id,
            'full_name' => $absence->full_name,
            'employee_id_number' => $absence->employee_id_number,
            'department' => $absence->department,
            'position' => $absence->position,
            'absence_type' => $absence->absence_type,
            'from_date' => $absence->from_date->format('Y-m-d'),
            'to_date' => $absence->to_date->format('Y-m-d'),
            'is_partial_day' => $absence->is_partial_day,
            'reason' => $absence->reason,
            'status' => $absence->status,
            'submitted_at' => $absence->submitted_at->format('Y-m-d'),
            'approved_at' => $absence->approved_at?->format('Y-m-d'),
            'days' => $absence->days,
            'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
            'picture' => $absence->employee ? $absence->employee->picture : null,
        ]);

        // Fetch employees for the add modal dropdown
        $employees = Employee::select('id', 'employeeid', 'employee_name', 'department', 'position')->get();

        return Inertia::render('absence/index', [
            'absences' => $absenceList,
            'employees' => $employees,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'employee_id' => 'nullable|exists:employees,id',
                'full_name' => 'required|string|max:255',
                'employee_id_number' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'absence_type' => 'required|in:Annual Leave,Personal Leave,Maternity/Paternity,Sick Leave,Emergency Leave,Other',
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'is_partial_day' => 'boolean',
                'reason' => 'required|string|min:10',
            ]);

            $absence = Absence::create([
                'employee_id' => $validated['employee_id'],
                'full_name' => $validated['full_name'],
                'employee_id_number' => $validated['employee_id_number'],
                'department' => $validated['department'],
                'position' => $validated['position'],
                'absence_type' => $validated['absence_type'],
                'from_date' => $validated['from_date'],
                'to_date' => $validated['to_date'],
                'is_partial_day' => $validated['is_partial_day'] ?? false,
                'reason' => $validated['reason'],
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            return redirect()->route('absence.index')->with('success', 'Absence request submitted successfully!');
        } catch (Exception $e) {
            Log::error('Absence creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to submit absence request. Please try again.');
        }
    }

    /**
     * Display the approval page.
     */
    public function approve()
    {
        $absences = Absence::with('employee', 'approver')
            ->orderBy('submitted_at', 'desc')
            ->get();

        $absenceList = $absences->transform(fn($absence) => [
            'id' => $absence->id,
            'name' => $absence->full_name,
            'department' => $absence->department,
            'type' => $absence->absence_type,
            'startDate' => $absence->from_date->format('Y-m-d'),
            'endDate' => $absence->to_date->format('Y-m-d'),
            'submittedAt' => $absence->submitted_at->format('Y-m-d'),
            'days' => $absence->days,
            'reason' => $absence->reason,
            'status' => $absence->status,
            'avatarUrl' => $absence->employee ? $absence->employee->picture : null,
        ]);

        return Inertia::render('absence/absence-approve', [
            'initialRequests' => $absenceList,
        ]);
    }

    /**
     * Update the status of an absence request.
     */
    public function updateStatus(Request $request, Absence $absence)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'approval_comments' => 'nullable|string',
        ]);

        $absence->update([
            'status' => $validated['status'],
            'approved_at' => in_array($validated['status'], ['approved', 'rejected']) ? now() : null,
            'approved_by' => in_array($validated['status'], ['approved', 'rejected']) ? Auth::id() : null,
            'approval_comments' => $validated['approval_comments'] ?? null,
        ]);

        // Check if this is an AJAX request
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        // For direct visits, redirect back to the absence approval page
        return redirect()->route('absence.absence-approve')->with('success', 'Absence status updated successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Absence $absence)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Absence $absence)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Absence $absence)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Absence $absence)
    {
        try {
            $absence->delete();

            // Check if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Absence request deleted successfully!']);
            }

            // For direct visits, redirect back to the absence index page
            return redirect()->route('absence.index')->with('success', 'Absence request deleted successfully!');
        } catch (Exception $e) {
            Log::error('Absence deletion failed: ' . $e->getMessage());

            // Check if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Failed to delete absence request. Please try again.'], 500);
            }

            return redirect()->back()->with('error', 'Failed to delete absence request. Please try again.');
        }
    }

    public function request()
    {
        $absences = Absence::with('employee', 'approver')
            ->orderBy('submitted_at', 'desc')
            ->get();

        $absenceList = $absences->transform(fn($absence) => [
            'id' => $absence->id,
            'full_name' => $absence->full_name,
            'employee_id_number' => $absence->employee_id_number,
            'department' => $absence->department,
            'position' => $absence->position,
            'absence_type' => $absence->absence_type,
            'from_date' => $absence->from_date->format('Y-m-d'),
            'to_date' => $absence->to_date->format('Y-m-d'),
            'submitted_at' => $absence->submitted_at->format('Y-m-d'),
            'days' => $absence->days,
            'reason' => $absence->reason,
            'is_partial_day' => $absence->is_partial_day,
            'status' => $absence->status,
            'picture' => $absence->employee ? $absence->employee->picture : null,
            'employee_name' => $absence->employee ? $absence->employee->employee_name : $absence->full_name,
        ]);

        return Inertia::render('absence/absence-approve', [
            'initialRequests' => $absenceList,
        ]);
    }
}
