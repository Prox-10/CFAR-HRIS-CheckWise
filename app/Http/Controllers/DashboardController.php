<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use App\Models\Leave;
use Illuminate\Support\Facades\DB;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
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

        // Base query for employees based on user role
        $employeeQuery = Employee::query();
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $employeeQuery->whereIn('department', $supervisedDepartments);
        }

        // Base query for leaves based on user role
        $leaveQuery = Leave::query();
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $leaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        // Total unique employees
        $totalEmployee = $employeeQuery->distinct('employeeid')->count('employeeid');

        // Total unique departments (for supervisor, only their supervised departments)
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $totalDepartment = count($supervisedDepartments);
        } else {
            $totalDepartment = Employee::distinct('department')->count('department');
        }

        // Total leave requests
        $totalLeave = $leaveQuery->count();

        // Pending leave requests
        $pendingLeave = $leaveQuery->where('leave_status', 'Pending')->count();

        // Previous period (previous month)
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();

        // Employees created before this month (as a proxy for previous total)
        $prevEmployeeQuery = Employee::where('created_at', '<', now()->startOfMonth());
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $prevEmployeeQuery->whereIn('department', $supervisedDepartments);
        }
        $prevTotalEmployee = $prevEmployeeQuery->distinct('employeeid')->count('employeeid');

        // Departments created before this month (as a proxy for previous total)
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $prevTotalDepartment = count($supervisedDepartments);
        } else {
            $prevTotalDepartment = Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department');
        }

        // Leaves created in previous month
        $prevLeaveQuery = Leave::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd]);
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $prevLeaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }
        $prevTotalLeave = $prevLeaveQuery->count();

        // Pending leaves in previous month
        $prevPendingLeaveQuery = Leave::where('leave_status', 'Pending')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd]);
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $prevPendingLeaveQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }
        $prevPendingLeave = $prevPendingLeaveQuery->count();

        // --- New code for chart ---
        // Get leave counts per month (all years, all types), but only for the last N months
        $monthsToShow = (int) request('months', 6); // Get from query, default to 6
        $now = now();
        $startDate = $now->copy()->subMonths($monthsToShow - 1)->startOfMonth();
        $endDate = $now->copy()->endOfMonth();

        $leavesPerMonthQuery = Leave::select(
            DB::raw('YEAR(leave_start_date) as year'),
            DB::raw('MONTH(leave_start_date) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('leave_start_date', [$startDate, $endDate]);

        if ($isSupervisor && !empty($supervisedDepartments)) {
            $leavesPerMonthQuery->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $leavesPerMonth = $leavesPerMonthQuery
            ->groupBy(DB::raw('YEAR(leave_start_date)'), DB::raw('MONTH(leave_start_date)'))
            ->orderBy(DB::raw('YEAR(leave_start_date)'))
            ->orderBy(DB::raw('MONTH(leave_start_date)'))
            ->get();

        $chartData = [];
        for ($i = 0; $i < $monthsToShow; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $monthNum = $date->month;
            $monthName = $date->format('F');
            $count = 0;
            foreach ($leavesPerMonth as $leave) {
                if ($leave->year == $year && $leave->month == $monthNum) {
                    $count = $leave->count;
                    break;
                }
            }
            $chartData[] = ['month' => $monthName, 'count' => $count];
        }
        // --- End new code for chart ---

        // --- New code for 6-month period chart ---
        // Get leave counts for Jan-Jun and Jul-Dec
        $leavesPerPeriodQuery1 = Leave::whereRaw('MONTH(leave_start_date) BETWEEN 1 AND 6');
        $leavesPerPeriodQuery2 = Leave::whereRaw('MONTH(leave_start_date) BETWEEN 7 AND 12');

        if ($isSupervisor && !empty($supervisedDepartments)) {
            $leavesPerPeriodQuery1->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
            $leavesPerPeriodQuery2->whereHas('employee', function ($query) use ($supervisedDepartments) {
                $query->whereIn('department', $supervisedDepartments);
            });
        }

        $leavesPerPeriod = [
            [
                'period' => 'January to June',
                'count' => $leavesPerPeriodQuery1->count(),
            ],
            [
                'period' => 'July to December',
                'count' => $leavesPerPeriodQuery2->count(),
            ],
        ];
        // --- End new code for 6-month period chart ---

        // Fetch admin notifications (latest 10) - only for super admin/manager
        $notifications = collect();
        $unreadCount = 0;
        if (!$isSupervisor) {
            $notifications = Notification::orderBy('created_at', 'desc')->take(10)->get();
            $unreadCount = Notification::whereNull('read_at')->count();
        }

        // Get user role information
        $userRole = $user->roles->first()?->name ?? 'User';
        $userDepartments = $isSupervisor ? $supervisedDepartments : [];

        // Get employees for supervisor dashboard
        $supervisorEmployees = collect();
        if ($isSupervisor && !empty($supervisedDepartments)) {
            $supervisorEmployees = Employee::whereIn('department', $supervisedDepartments)
                ->select('id', 'employee_name', 'department', 'position', 'picture', 'employeeid')
                ->orderBy('employee_name')
                ->take(5) // Show top 5 employees
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->employee_name,
                        'department' => $employee->department,
                        'position' => $employee->position,
                        'picture' => $employee->picture,
                        'employeeid' => $employee->employeeid,
                        'initials' => $this->getInitials($employee->employee_name),
                    ];
                });
        }

        return Inertia::render('dashboard/index', [
            'totalEmployee' => $totalEmployee,
            'prevTotalEmployee' => $prevTotalEmployee,
            'totalDepartment' => $totalDepartment,
            'prevTotalDepartment' => $prevTotalDepartment,
            'totalLeave' => $totalLeave,
            'prevTotalLeave' => $prevTotalLeave,
            'pendingLeave' => $pendingLeave,
            'prevPendingLeave' => $prevPendingLeave,
            'leavesPerMonth' => $chartData, // For monthly chart data
            'leavesPerPeriod' => $leavesPerPeriod, // For 6-month period chart data
            'months' => $monthsToShow, // Pass selected months to frontend
            // Add notifications for admin bell
            'notifications' => $notifications,
            'unreadNotificationCount' => $unreadCount,
            // Add user role information
            'userRole' => $userRole,
            'isSupervisor' => $isSupervisor,
            'isSuperAdmin' => $isSuperAdmin,
            'supervisedDepartments' => $userDepartments,
            // Add supervisor employees data
            'supervisorEmployees' => $supervisorEmployees,
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get initials from employee name
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', trim($name));
        $initials = '';

        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }

        return substr($initials, 0, 2); // Return max 2 initials
    }
}
