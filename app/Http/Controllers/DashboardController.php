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

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Total unique employees
        $totalEmployee = Employee::distinct('employeeid')->count('employeeid');
        // Total unique departments
        $totalDepartment = Employee::distinct('department')->count('department');
        // Total leave requests
        $totalLeave = Leave::count();
        // Pending leave requests
        $pendingLeave = Leave::where('leave_status', 'Pending')->count();

        // Previous period (previous month)
        $prevMonthStart = now()->subMonth()->startOfMonth();
        $prevMonthEnd = now()->subMonth()->endOfMonth();

        // Employees created before this month (as a proxy for previous total)
        $prevTotalEmployee = Employee::where('created_at', '<', now()->startOfMonth())->distinct('employeeid')->count('employeeid');
        // Departments created before this month (as a proxy for previous total)
        $prevTotalDepartment = Employee::where('created_at', '<', now()->startOfMonth())->distinct('department')->count('department');
        // Leaves created in previous month
        $prevTotalLeave = Leave::whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();
        // Pending leaves in previous month
        $prevPendingLeave = Leave::where('leave_status', 'Pending')->whereBetween('created_at', [$prevMonthStart, $prevMonthEnd])->count();

        // --- New code for chart ---
        // Get leave counts per month (all years, all types), but only for the last N months
        $monthsToShow = (int) request('months', 6); // Get from query, default to 6
        $now = now();
        $startDate = $now->copy()->subMonths($monthsToShow - 1)->startOfMonth();
        $endDate = $now->copy()->endOfMonth();

        $leavesPerMonth = Leave::select(
            DB::raw('YEAR(leave_start_date) as year'),
            DB::raw('MONTH(leave_start_date) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('leave_start_date', [$startDate, $endDate])
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
        $leavesPerPeriod = [
            [
                'period' => 'January to June',
                'count' => Leave::whereRaw('MONTH(leave_start_date) BETWEEN 1 AND 6')->count(),
            ],
            [
                'period' => 'July to December',
                'count' => Leave::whereRaw('MONTH(leave_start_date) BETWEEN 7 AND 12')->count(),
            ],
        ];
        // --- End new code for 6-month period chart ---

        // Fetch admin notifications (latest 10)
        $notifications = Notification::orderBy('created_at', 'desc')->take(10)->get();
        $unreadCount = Notification::whereNull('read_at')->count(); 

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
}
