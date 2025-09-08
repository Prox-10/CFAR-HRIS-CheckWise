<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveCredit;
use App\Models\Absence;
use App\Models\AbsenceCredit;
use App\Models\Evaluation;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
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
            return redirect()->route('employeelogin');
        }

        // Get real data for dashboard
        $dashboardData = $this->getDashboardData($employee);

        return Inertia::render('employee-view/dashboard', [
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

        // Leave Balance (using credits)
        $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id, $currentYear);
        $leaveBalance = $leaveCredits->remaining_credits;

        // Absence Credits
        $absenceCredits = AbsenceCredit::getOrCreateForEmployee($employee->id);
        $absenceBalance = $absenceCredits->remaining_credits;

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

        // Get Leave Requests
        $leaveRequests = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'leave_type' => $leave->leave_type,
                    'leave_start_date' => $leave->leave_start_date->format('Y-m-d'),
                    'leave_end_date' => $leave->leave_end_date->format('Y-m-d'),
                    'leave_days' => $leave->leave_days,
                    'leave_status' => $leave->leave_status,
                    'leave_reason' => $leave->leave_reason,
                    'created_at' => $leave->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get Absence Requests
        $absenceRequests = Absence::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => $absence->id,
                    'absence_type' => $absence->absence_type,
                    'from_date' => $absence->from_date->format('Y-m-d'),
                    'to_date' => $absence->to_date->format('Y-m-d'),
                    'days' => $absence->days,
                    'status' => $absence->status,
                    'reason' => $absence->reason,
                    'created_at' => $absence->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get Notifications for Employee
        $notifications = \App\Models\Notification::where('type', 'like', '%employee%')
            ->orWhere('type', 'like', '%leave%')
            ->orWhere('type', 'like', '%absence%')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at ? $notification->read_at->format('Y-m-d H:i:s') : null,
                    'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $unreadNotificationCount = \App\Models\Notification::whereNull('read_at')
            ->where(function ($query) {
                $query->where('type', 'like', '%employee%')
                    ->orWhere('type', 'like', '%leave%')
                    ->orWhere('type', 'like', '%absence%');
            })
            ->count();

        return [
            'leaveBalance' => $leaveBalance,
            'absenceCount' => $absenceCount,
            'absenceBalance' => $absenceBalance,
            'evaluationRating' => $evaluationRating,
            'assignedArea' => $employee->department,
            'attendancePercentage' => $attendancePercentage,
            'productivity' => $productivity,
            'recentActivities' => $recentActivities,
            // Enhanced data
            'leaveCredits' => [
                'remaining' => $leaveCredits->remaining_credits,
                'used' => $leaveCredits->used_credits,
                'total' => $leaveCredits->total_credits,
            ],
            'absenceCredits' => [
                'remaining' => $absenceCredits->remaining_credits,
                'used' => $absenceCredits->used_credits,
                'total' => $absenceCredits->total_credits,
            ],
            'leaveRequests' => $leaveRequests,
            'absenceRequests' => $absenceRequests,
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadNotificationCount,
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
                'title' => ucfirst($leave->leave_type) . ' Leave request ' . $leave->leave_status,
                'timeAgo' => $leave->created_at->diffForHumans(),
                'status' => strtolower($leave->leave_status), // Convert to lowercase for consistent status mapping
                'type' => 'leave'
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
                'title' => ucfirst($absence->absence_type) . ' Absence request ' . $absence->status,
                'timeAgo' => $absence->created_at->diffForHumans(),
                'status' => strtolower($absence->status), // Convert to lowercase for consistent status mapping
                'type' => 'absence'
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
                'status' => 'completed',
                'type' => 'evaluation'
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
        return Inertia::render('employee-view/login');
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

        return redirect()->route('employee-view');
    }

    /**
     * Handle employee logout
     */
    public function logout()
    {
        Session::forget(['employee_id', 'employee_name']);
        Session::flush(); // Clear all session data
        return redirect()->route('employeelogin')->with('status', 'You have been successfully logged out.');
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

        return Inertia::render('employee-view/profile', [
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

        return Inertia::render('employee-view/attendance', [
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

        // Log request context
        Log::info('[EmployeeView] Fetching evaluations page', [
            'session_employee_id' => Session::get('employee_id'),
            'resolved_employee_id' => $employee?->id,
            'resolved_employee_name' => $employee?->employee_name,
        ]);

        // Get latest evaluation with relations (new structure)
        $evaluation = Evaluation::with(['attendance', 'attitudes', 'workAttitude', 'workFunctions'])
            ->where('employee_id', $employee->id)
            ->orderBy('rating_date', 'desc')
            ->first();

        if ($evaluation) {
            Log::info('[EmployeeView] Latest evaluation found', [
                'evaluation_id' => $evaluation->id,
                'rating_date' => optional($evaluation->rating_date)->format('Y-m-d'),
                'total_rating' => $evaluation->total_rating,
                'has_attendance' => (bool) $evaluation->attendance,
                'has_attitudes' => (bool) $evaluation->attitudes,
                'has_workAttitude' => (bool) $evaluation->workAttitude,
                'workFunctions_count' => $evaluation->workFunctions?->count() ?? 0,
            ]);
        } else {
            Log::warning('[EmployeeView] No evaluation found for employee', [
                'employee_id' => $employee->id,
            ]);
        }

        return Inertia::render('employee-view/evaluations', [
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
                'ratings' => $evaluation->ratings ?? null,
                'rating_date' => optional($evaluation->rating_date)->format('Y-m-d'),
                // legacy flat fields (some historical records)
                'work_quality' => $evaluation->work_quality ?? null,
                'safety_compliance' => $evaluation->safety_compliance ?? null,
                'punctuality' => $evaluation->punctuality ?? null,
                'teamwork' => $evaluation->teamwork ?? null,
                'organization' => $evaluation->organization ?? null,
                'equipment_handling' => $evaluation->equipment_handling ?? null,
                'comment' => $evaluation->comment ?? null,
                // new structure
                'total_rating' => $evaluation->total_rating,
                'evaluation_year' => $evaluation->evaluation_year,
                'evaluation_period' => $evaluation->evaluation_period,
                'evaluation_frequency' => $evaluation->evaluation_frequency,
                'evaluator' => $evaluation->evaluator,
                'observations' => $evaluation->observations,
                'attendance' => $evaluation->attendance ? [
                    'daysLate' => $evaluation->attendance->days_late,
                    'daysAbsent' => $evaluation->attendance->days_absent,
                    'rating' => $evaluation->attendance->rating,
                    'remarks' => $evaluation->attendance->remarks,
                ] : null,
                'attitudes' => $evaluation->attitudes ? [
                    'supervisor_rating' => $evaluation->attitudes->supervisor_rating,
                    'supervisor_remarks' => $evaluation->attitudes->supervisor_remarks,
                    'coworker_rating' => $evaluation->attitudes->coworker_rating,
                    'coworker_remarks' => $evaluation->attitudes->coworker_remarks,
                ] : null,
                'workAttitude' => $evaluation->workAttitude ? [
                    'responsible' => $evaluation->workAttitude->responsible,
                    'jobKnowledge' => $evaluation->workAttitude->job_knowledge,
                    'cooperation' => $evaluation->workAttitude->cooperation,
                    'initiative' => $evaluation->workAttitude->initiative,
                    'dependability' => $evaluation->workAttitude->dependability,
                    'remarks' => $evaluation->workAttitude->remarks,
                ] : null,
                'workFunctions' => $evaluation->workFunctions?->map(function ($wf) {
                    return [
                        'function_name' => $wf->function_name,
                        'work_quality' => $wf->work_quality,
                        'work_efficiency' => $wf->work_efficiency,
                    ];
                }) ?? [],
            ] : null
        ]);
    }

    /**
     * Display employee leave
     */
    public function leave()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        // Calculate leave balance (using credits)
        $currentYear = Carbon::now()->year;
        $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id, $currentYear);
        $leaveBalance = $leaveCredits->remaining_credits;

        return Inertia::render('employee-view/request-form/leave/index', [
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

        return Inertia::render('employee-view/request-form/absence/index', [
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

        return Inertia::render('employee-view/request-form/return-request/absence', [
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

        // Calculate summary (using credits)
        $currentYear = Carbon::now()->year;
        $leaveCredits = LeaveCredit::getOrCreateForEmployee($employee->id, $currentYear);
        $leaveBalance = $leaveCredits->remaining_credits;

        $summary = [
            'leaveDaysRemaining' => $leaveBalance,
            'totalRequests' => $allRecords->count(),
            'approved' => $allRecords->where('status', 'approved')->count(),
            'pending' => $allRecords->where('status', 'pending')->count(),
        ];

        return Inertia::render('employee-view/records', [
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

        return redirect('home');
    }

    /**
     * Display employee profile settings page
     */
    public function profileSettings()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        return Inertia::render('employee-view/profile-settings', [
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
            ]
        ]);
    }

    /**
     * Update employee profile (name and picture)
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'firstname' => 'required|string|max:100',
            'lastname' => 'required|string|max:100',
            'profile_image' => 'nullable|image|max:5120',
        ]);

        $employee = Employee::where('employeeid', Session::get('employee_id'))->firstOrFail();

        $employee->firstname = $request->firstname;
        $employee->lastname = $request->lastname;
        $employee->employee_name = trim($request->firstname . ' ' . $request->lastname);

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $filename, 'public');
            $employee->picture = '/storage/' . $path;
        }

        $employee->save();

        return back()->with('status', 'Profile updated successfully.');
    }

    /**
     * Update employee password/PIN
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:4|confirmed',
        ]);

        $employee = Employee::where('employeeid', Session::get('employee_id'))->firstOrFail();

        if ($employee->pin !== $request->current_password) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $employee->pin = $request->new_password;
        $employee->save();

        return back()->with('status', 'Password updated successfully.');
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|string',
        ]);

        $notification = \App\Models\Notification::find($request->notification_id);

        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return back()->with('success', 'Notification marked as read');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->firstOrFail();

        \App\Models\Notification::whereNull('read_at')
            ->where(function ($query) {
                $query->where('type', 'like', '%employee%')
                    ->orWhere('type', 'like', '%leave%')
                    ->orWhere('type', 'like', '%absence%');
            })
            ->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read');
    }

    /**
     * Refresh dashboard data for real-time updates
     */
    public function refreshDashboard()
    {
        $employee = Employee::where('employeeid', Session::get('employee_id'))->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $dashboardData = $this->getDashboardData($employee);

        return response()->json([
            'dashboardData' => $dashboardData,
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
}
