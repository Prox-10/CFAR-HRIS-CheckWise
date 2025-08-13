<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\Absence;
use App\Models\Evaluation;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;

class AuthEmployeeController extends Controller
{
    /**
     * Display employee dashboard (requires authentication)
     */
    public function index()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            Session::forget(['employee_id', 'employee_name']);
            return redirect()->route('employee_login');
        }

        // Get real data for dashboard
        $dashboardData = $this->getDashboardData($employee);

        return Inertia::render('employee_view/index', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ],
            'dashboardData' => $dashboardData
        ]);
    }

    /**
     * Get dashboard data for employee
     */
    private function getDashboardData($employee)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $currentYear = Carbon::now()->year;

        // Leave Balance
        $approvedLeaves = Leave::where('employee_id', $employee->id)
            ->where('leave_status', 'approved')
            ->whereYear('leave_start_date', $currentYear)
            ->sum('leave_days');

        $totalLeaveDays = 15; // Assuming 15 days annual leave
        $leaveBalance = max(0, $totalLeaveDays - $approvedLeaves);

        // Absence Count (this month)
        $absenceCount = Absence::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereMonth('from_date', $currentMonth->month)
            ->whereYear('from_date', $currentMonth->year)
            ->count();

        // Latest Evaluation Rating
        $latestEvaluation = Evaluation::where('employee_id', $employee->id)
            ->orderBy('rating_date', 'desc')
            ->first();

        $evaluationRating = $latestEvaluation ? $this->calculateAverageRating($latestEvaluation) : 0;

        // Attendance Percentage (this month)
        $totalWorkDays = $this->getTotalWorkDays($currentMonth);
        $presentDays = Attendance::where('employee_id', $employee->id)
            ->where('attendance_status', 'Present')
            ->whereMonth('attendance_date', $currentMonth->month)
            ->whereYear('attendance_date', $currentMonth->year)
            ->count();

        $attendancePercentage = $totalWorkDays > 0 ? round(($presentDays / $totalWorkDays) * 100, 1) : 0;

        // Productivity (estimated based on attendance and evaluations)
        // For 10-star scale: convert to percentage (10 stars = 100%, so multiply by 10)
        $productivity = min(100, round(($attendancePercentage * 0.7) + ($evaluationRating * 10 * 0.3), 1));

        // Recent Activities
        $recentActivities = $this->getRecentActivities($employee);

        return [
            'leaveBalance' => $leaveBalance,
            'absenceCount' => $absenceCount,
            'evaluationRating' => $evaluationRating,
            'assignedArea' => $employee->department,
            'attendancePercentage' => $attendancePercentage,
            'productivity' => $productivity,
            'recentActivities' => $recentActivities,
        ];
    }

    /**
     * Calculate average rating from evaluation
     */
    private function calculateAverageRating($evaluation)
    {
        $ratings = [
            $this->convertRatingToNumber($evaluation->work_quality),
            $this->convertRatingToNumber($evaluation->safety_compliance),
            $this->convertRatingToNumber($evaluation->punctuality),
            $this->convertRatingToNumber($evaluation->teamwork),
            $this->convertRatingToNumber($evaluation->organization),
            $this->convertRatingToNumber($evaluation->equipment_handling),
        ];

        return round(array_sum($ratings) / count($ratings), 1);
    }

    /**
     * Convert rating string to number
     */
    private function convertRatingToNumber($rating)
    {
        // If it's already a number (1-10 scale), return it as is
        if (is_numeric($rating) && $rating >= 1 && $rating <= 10) {
            return (float) $rating;
        }

        // Fallback for old text-based ratings
        $ratingMap = [
            'Excellent' => 10,
            'Very Good' => 8,
            'Good' => 6,
            'Fair' => 4,
            'Poor' => 2,
        ];

        return $ratingMap[$rating] ?? 6;
    }

    /**
     * Get total work days in a month (excluding weekends)
     */
    private function getTotalWorkDays($month)
    {
        $days = 0;
        $current = $month->copy();

        while ($current->month === $month->month) {
            if ($current->isWeekday()) {
                $days++;
            }
            $current->addDay();
        }

        return $days;
    }

    /**
     * Get recent activities for employee
     */
    private function getRecentActivities($employee)
    {
        $activities = [];

        // Recent leave requests
        $recentLeaves = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentLeaves as $leave) {
            $activities[] = [
                'id' => 'leave_' . $leave->id,
                'title' => ucfirst($leave->leave_type) . ' request ' . $leave->leave_status,
                'timeAgo' => $leave->created_at->diffForHumans(),
                'status' => $leave->leave_status === 'approved' ? 'approved' : ($leave->leave_status === 'rejected' ? 'completed' : 'pending')
            ];
        }

        // Recent absence requests
        $recentAbsences = Absence::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentAbsences as $absence) {
            $activities[] = [
                'id' => 'absence_' . $absence->id,
                'title' => ucfirst($absence->absence_type) . ' request ' . $absence->status,
                'timeAgo' => $absence->created_at->diffForHumans(),
                'status' => $absence->status
            ];
        }

        // Recent evaluations
        $recentEvaluations = Evaluation::where('employee_id', $employee->id)
            ->orderBy('rating_date', 'desc')
            ->limit(1)
            ->get();

        foreach ($recentEvaluations as $evaluation) {
            $activities[] = [
                'id' => 'evaluation_' . $evaluation->id,
                'title' => 'Performance evaluation completed',
                'timeAgo' => Carbon::parse($evaluation->rating_date)->diffForHumans(),
                'status' => 'completed'
            ];
        }

        // Sort by most recent and limit to 4
        usort($activities, function ($a, $b) {
            return strtotime($b['timeAgo']) - strtotime($a['timeAgo']);
        });

        return array_slice($activities, 0, 4);
    }

    /**
     * Show employee login form
     */
    public function create(): Response
    {
        return Inertia::render('employee_view/login');
    }

    /**
     * Handle employee login
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string',
            'pin' => 'required|string',
        ]);

        $employee = Employee::where('employeeid', $request->employee_id)->first();

        if (!$employee) {
            return back()->withErrors([
                'employee_id' => 'Employee ID not found.',
            ]);
        }

        if ($employee->pin !== $request->pin) {
            return back()->withErrors([
                'pin' => 'Invalid PIN.',
            ]);
        }

        // Store employee session
        Session::put('employee_id', $employee->employeeid);
        Session::put('employee_name', $employee->employee_name);

        return redirect()->route('employee_view');
    }

    /**
     * Handle employee logout
     */
    public function logout()
    {
        Session::forget(['employee_id', 'employee_name']);
        Session::flush(); // Clear all session data
        return redirect()->route('employee_login')->with('status', 'You have been successfully logged out.');
    }

    /**
     * Reset employee PIN
     */
    public function resetPin(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|string',
        ]);

        $employee = Employee::where('employeeid', $request->employee_id)->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found.'
            ], 404);
        }

        $newPin = $employee->resetPin();

        return response()->json([
            'success' => true,
            'message' => 'PIN reset successfully.',
            'pin' => $newPin
        ]);
    }

    /**
     * Display employee profile
     */
    public function profile()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee_view/profile', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'address' => null, // Add address field to employee model if needed
            ]
        ]);
    }

    /**
     * Display employee attendance
     */
    public function attendance()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee_view/attendance', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ]
        ]);
    }

    /**
     * Display employee evaluations
     */
    public function evaluations()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        // Get latest evaluation
        $evaluation = Evaluation::where('employee_id', $employee->id)
            ->orderBy('rating_date', 'desc')
            ->first();

        return Inertia::render('employee_view/evaluations', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ],
            'evaluation' => $evaluation ? [
                'id' => $evaluation->id,
                'ratings' => $evaluation->ratings,
                'rating_date' => $evaluation->rating_date,
                'work_quality' => $evaluation->work_quality,
                'safety_compliance' => $evaluation->safety_compliance,
                'punctuality' => $evaluation->punctuality,
                'teamwork' => $evaluation->teamwork,
                'organization' => $evaluation->organization,
                'equipment_handling' => $evaluation->equipment_handling,
                'comment' => $evaluation->comment,
            ] : null
        ]);
    }

    /**
     * Display employee leave
     */
    public function leave()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        // Calculate leave balance
        $currentYear = Carbon::now()->year;
        $approvedLeaves = Leave::where('employee_id', $employee->id)
            ->where('leave_status', 'approved')
            ->whereYear('leave_start_date', $currentYear)
            ->sum('leave_days');

        $totalLeaveDays = 15; // Assuming 15 days annual leave
        $leaveBalance = max(0, $totalLeaveDays - $approvedLeaves);

        return Inertia::render('employee_view/leave', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ],
            'leaveBalance' => $leaveBalance
        ]);
    }

    /**
     * Display employee absence form
     */
    public function absence()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee_view/absence', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ]
        ]);
    }

    /**
     * Display employee return to work form
     */
    public function returnWork()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        // Get previous absences for reference
        $previousAbsences = Absence::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->orderBy('from_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => $absence->id,
                    'date' => $absence->from_date->format('Y-m-d'),
                    'type' => $absence->absence_type,
                    'reason' => $absence->reason
                ];
            });

        return Inertia::render('employee_view/return-work', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ],
            'previousAbsences' => $previousAbsences
        ]);
    }

    /**
     * Display employee leave/absence records
     */
    public function records()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        // Get leave records
        $leaveRecords = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => 'REQ' . str_pad($leave->id, 3, '0', STR_PAD_LEFT),
                    'type' => 'Leave (' . ucfirst($leave->leave_type) . ')',
                    'dates' => $leave->leave_start_date->format('Y-m-d') . ' to ' . $leave->leave_end_date->format('Y-m-d'),
                    'days' => $leave->leave_days . ' days',
                    'status' => $leave->leave_status,
                    'submitted' => $leave->created_at->format('Y-m-d'),
                    'comments' => $leave->leave_reason
                ];
            });

        // Get absence records
        $absenceRecords = Absence::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => 'ABS' . str_pad($absence->id, 3, '0', STR_PAD_LEFT),
                    'type' => 'Absence (' . $absence->absence_type . ')',
                    'dates' => $absence->from_date->format('Y-m-d'),
                    'days' => $absence->days . ' day' . ($absence->days > 1 ? 's' : ''),
                    'status' => $absence->status,
                    'submitted' => $absence->created_at->format('Y-m-d'),
                    'comments' => $absence->reason
                ];
            });

        // Combine and sort records
        $allRecords = $leaveRecords->concat($absenceRecords)
            ->sortByDesc('submitted')
            ->values();

        // Calculate summary
        $currentYear = Carbon::now()->year;
        $approvedLeaves = Leave::where('employee_id', $employee->id)
            ->where('leave_status', 'approved')
            ->whereYear('leave_start_date', $currentYear)
            ->sum('leave_days');

        $totalLeaveDays = 15;
        $leaveBalance = max(0, $totalLeaveDays - $approvedLeaves);

        $summary = [
            'leaveDaysRemaining' => $leaveBalance,
            'totalRequests' => $allRecords->count(),
            'approved' => $allRecords->where('status', 'approved')->count(),
            'pending' => $allRecords->where('status', 'pending')->count(),
        ];

        return Inertia::render('employee_view/records', [
            'employee' => [
                'id' => $employee->id,
                'employeeid' => $employee->employeeid,
                'employee_name' => $employee->employee_name,
                'firstname' => $employee->firstname,
                'lastname' => $employee->lastname,
                'department' => $employee->department,
                'position' => $employee->position,
                'picture' => $employee->picture,
            ],
            'records' => $allRecords,
            'summary' => $summary
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        //
    }

    public function logouts(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
